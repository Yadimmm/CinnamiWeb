// src/utils/safeImgSrc.js
import javierVazquezFoto from '../assets/users/userfoto2.png';

export function safeImgSrc(src, fallback) {
  if (
    typeof src === "string" &&
    !src.match(/[\s\r\n]/) &&
    !/^javascript:/i.test(src) &&
    (
      src.startsWith("data:image/") ||
      src.startsWith("http://localhost") ||
      src.startsWith("https://localhost") ||
      src.startsWith("http://127.0.0.1") ||
      src.startsWith("https://127.0.0.1") ||
      src.startsWith("/")
    )
  ) {
    return encodeURI(src);
  }
  return fallback || javierVazquezFoto;
}
