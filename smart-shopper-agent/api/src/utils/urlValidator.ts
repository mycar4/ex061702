/**
 * WHATWG URL Standard 기반 쇼핑몰 아웃링크 URL 검증기
 * XSS 방지를 위해 http:, https: 프로토콜의 화이트리스트만 허용합니다.
 */
export function validateShoppingUrl(urlString: string): boolean {
  try {
    // WHATWG 표준 URL 생성자 사용 (유효하지 않은 URL 포맷인 경우 에러 유발)
    const parsedUrl = new URL(urlString);

    // 허용된 프로토콜 화이트리스트 (http:, https:) 검증
    const allowedProtocols = ['http:', 'https:'];
    
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      console.warn(`[Security Alert] Blocked non-whitelist protocol: ${parsedUrl.protocol}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[Security Alert] Invalid URL format: ${urlString}`, error);
    return false;
  }
}
