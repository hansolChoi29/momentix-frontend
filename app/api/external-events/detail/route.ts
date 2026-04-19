import { NextRequest, NextResponse } from 'next/server';
import { Event } from '@/types';

function decodeXmlText(input: string) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTagValue(xml: string, tagName: string) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const found = xml.match(regex)?.[1] ?? '';
  return decodeXmlText(found).trim();
}

function parseKopisDate(input?: string) {
  if (!input) return '';
  const onlyDigits = input.replace(/\D/g, '');
  if (onlyDigits.length !== 8) return '';
  return `${onlyDigits.slice(0, 4)}-${onlyDigits.slice(4, 6)}-${onlyDigits.slice(6, 8)}`;
}

function parseEventId(mt20id: string) {
  const n = Number(mt20id.replace(/\D/g, ''));
  if (Number.isNaN(n) || n <= 0) return Date.now();
  return 900000000 + n;
}

function toEventCategory(genrenm: string): Event['category'] {
  if (genrenm.includes('뮤지컬')) return 'MUSICAL';
  if (genrenm.includes('연극')) return 'PLAY';
  return 'CONCERT';
}

function toEventStatus(prfstate: string): Event['status'] {
  if (prfstate === '공연예정') return 'UPCOMING';
  if (prfstate === '공연완료') return 'ENDED';
  return 'ON_SALE';
}

function parsePriceRange(guidance: string) {
  const matches = Array.from(guidance.matchAll(/(\d[\d,]*)\s*원/g)).map((m) =>
    Number((m[1] ?? '').replace(/,/g, ''))
  );
  const valid = matches.filter((n) => Number.isFinite(n) && n > 0);
  if (valid.length === 0) return { minPrice: 0, maxPrice: 0 };
  return {
    minPrice: Math.min(...valid),
    maxPrice: Math.max(...valid),
  };
}

export async function GET(request: NextRequest) {
  const serviceKey =
    process.env.KOPIS_SERVICE_KEY || process.env.NEXT_PUBLIC_KOPIS_SERVICE_KEY;
  const externalEventId = request.nextUrl.searchParams.get('externalEventId') ?? '';

  if (!serviceKey || !externalEventId) {
    return NextResponse.json(
      { message: 'Missing KOPIS_SERVICE_KEY or externalEventId' },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    service: serviceKey,
  });
  const url = `https://www.kopis.or.kr/openApi/restful/pblprfr/${externalEventId}?${params.toString()}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return NextResponse.json(
      { message: 'Failed to fetch KOPIS detail' },
      { status: 502 }
    );
  }

  const xml = await response.text();
  const from = parseKopisDate(getTagValue(xml, 'prfpdfrom'));
  const to = parseKopisDate(getTagValue(xml, 'prfpdto'));
  const mt20id = getTagValue(xml, 'mt20id') || externalEventId;
  const title = getTagValue(xml, 'prfnm');
  const genre = getTagValue(xml, 'genrenm');
  const prfstate = getTagValue(xml, 'prfstate');
  const venue = getTagValue(xml, 'fcltynm');
  const area = getTagValue(xml, 'area');
  const poster = getTagValue(xml, 'poster');
  const runtimeRaw = getTagValue(xml, 'prfruntime');
  const hostName = getTagValue(xml, 'entrpsnmH');
  const age = getTagValue(xml, 'prfage');
  const guidance = getTagValue(xml, 'pcseguidance');
  const sty = getTagValue(xml, 'sty');
  const priceRange = parsePriceRange(guidance);

  const runtime = Number(runtimeRaw.replace(/\D/g, '')) || undefined;

  const event: Event = {
    eventId: parseEventId(mt20id),
    externalEventId: mt20id,
    sourceType: 'EXTERNAL',
    provider: 'KOPIS',
    title: title || '외부 공연',
    description: sty || '',
    category: toEventCategory(genre),
    status: toEventStatus(prfstate),
    posterUrl: poster,
    venue: {
      venueId: 0,
      name: venue || '외부 공연장',
      address: area || '',
      capacity: 0,
    },
    schedules: from
      ? [
          {
            scheduleId: 1,
            date: from,
            startTime: '',
            endTime: to || '',
          },
        ]
      : [],
    minPrice: priceRange.minPrice,
    maxPrice: priceRange.maxPrice,
    runningTime: runtime,
    rating: age || undefined,
    hostName: hostName || undefined,
    tags: guidance ? [guidance] : [],
  };

  return NextResponse.json(event);
}
