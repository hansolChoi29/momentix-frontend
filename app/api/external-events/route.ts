import { NextRequest, NextResponse } from 'next/server';
import { normalizeEventCategory } from '@/lib/events';
import { Event } from '@/types';

type ExternalEventsResponse = {
  content: Event[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const KOPIS_CATEGORY_CODE: Record<string, string> = {
  PLAY: 'AAAA',
  MUSICAL: 'GGGA',
  CONCERT: 'CCCD',
};

const STATE_TO_STATUS: Record<string, Event['status']> = {
  '공연중': 'ON_SALE',
  '공연예정': 'UPCOMING',
  '공연완료': 'ENDED',
};

function formatYmd(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseKopisDate(input?: string) {
  if (!input) return '';
  const onlyDigits = input.replace(/\D/g, '');
  if (onlyDigits.length !== 8) return '';
  return `${onlyDigits.slice(0, 4)}-${onlyDigits.slice(4, 6)}-${onlyDigits.slice(6, 8)}`;
}

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

function parseDbBlocks(xml: string) {
  return Array.from(xml.matchAll(/<db>([\s\S]*?)<\/db>/gi)).map((v) => v[1]);
}

function toEventCategory(genrenm: string): Event['category'] {
  if (genrenm.includes('뮤지컬')) return 'MUSICAL';
  if (genrenm.includes('연극')) return 'PLAY';
  return 'CONCERT';
}

function toEventStatus(prfstate: string): Event['status'] {
  return STATE_TO_STATUS[prfstate] ?? 'ON_SALE';
}

function parseEventId(mt20id: string) {
  const n = Number(mt20id.replace(/\D/g, ''));
  if (Number.isNaN(n) || n <= 0) return Date.now();
  return 900000000 + n;
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

async function fetchDetailPrice(
  serviceKey: string,
  externalEventId: string
): Promise<{ minPrice: number; maxPrice: number }> {
  const params = new URLSearchParams({ service: serviceKey });
  const url = `https://www.kopis.or.kr/openApi/restful/pblprfr/${externalEventId}?${params.toString()}`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return { minPrice: 0, maxPrice: 0 };
    const xml = await response.text();
    const guidance = getTagValue(xml, 'pcseguidance');
    return parsePriceRange(guidance);
  } catch {
    return { minPrice: 0, maxPrice: 0 };
  }
}

export async function GET(request: NextRequest) {
  const serviceKey = process.env.KOPIS_SERVICE_KEY || process.env.NEXT_PUBLIC_KOPIS_SERVICE_KEY;
  if (!serviceKey) {
    const empty: ExternalEventsResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 16,
    };
    return NextResponse.json(empty);
  }

  const categoryParam = request.nextUrl.searchParams.get('category');
  const normalizedCategory = categoryParam ? normalizeEventCategory(categoryParam) : '';
  const page = Math.max(0, Number(request.nextUrl.searchParams.get('page') ?? '0'));
  const size = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('size') ?? '16')));

  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 31);

  const params = new URLSearchParams({
    service: serviceKey,
    stdate: formatYmd(now),
    eddate: formatYmd(end),
    cpage: String(page + 1),
    rows: String(size),
  });

  if (normalizedCategory) {
    params.set('shcate', KOPIS_CATEGORY_CODE[normalizedCategory] ?? KOPIS_CATEGORY_CODE.CONCERT);
  }

  const url = `https://www.kopis.or.kr/openApi/restful/pblprfr?${params.toString()}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return NextResponse.json({ message: 'Failed to fetch KOPIS' }, { status: 502 });
  }

  const xml = await response.text();
  const blocks = parseDbBlocks(xml);

  const content: Event[] = await Promise.all(
    blocks.map(async (block) => {
    const mt20id = getTagValue(block, 'mt20id');
    const title = getTagValue(block, 'prfnm');
    const genreName = getTagValue(block, 'genrenm');
    const prfstate = getTagValue(block, 'prfstate');
    const from = parseKopisDate(getTagValue(block, 'prfpdfrom'));
    const to = parseKopisDate(getTagValue(block, 'prfpdto'));
    const poster = getTagValue(block, 'poster');
    const venue = getTagValue(block, 'fcltynm');
    const area = getTagValue(block, 'area');
    const priceGuidance = getTagValue(block, 'pcseguidance');
    const parsedFromList = parsePriceRange(priceGuidance);
    const priceRange =
      parsedFromList.minPrice > 0
        ? parsedFromList
        : await fetchDetailPrice(serviceKey, mt20id);

    return {
      eventId: parseEventId(mt20id),
      externalEventId: mt20id,
      sourceType: 'EXTERNAL',
      provider: 'KOPIS',
      title,
      description: '',
      category: toEventCategory(genreName),
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
              scheduleId: 0,
              date: from,
              startTime: '',
              endTime: to || '',
            },
          ]
        : [],
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
    };
    })
  );

  const payload: ExternalEventsResponse = {
    content,
    totalElements: content.length,
    totalPages: content.length > 0 ? Math.ceil(content.length / size) : 0,
    number: page,
    size,
  };

  return NextResponse.json(payload);
}
