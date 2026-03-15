"""
Website Crawler - Sitemap discovery, target page identification, raw HTML extraction.
Supports sitemap index files and nested sitemaps.
"""

import re
import time
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
import trafilatura
import xml.etree.ElementTree as ET


class WebsiteCrawler:
    TARGET_PATTERNS = [
        r"/customers?",
        r"/case-stud(y|ies)",
        r"/pricing",
        r"/testimonials?",
        r"/reviews?",
        r"/success-stor(y|ies)",
        r"/solutions?",
        r"/use-cases?",
        r"/about",
        r"/wall-of-love",
        r"/stories",
        r"/clients?",
        r"/partners?",
        r"/industries",
        r"/enterprise",
        r"/features?",
        r"/product",
    ]

    def __init__(self, base_url: str, max_pages: int = 20):
        self.base_url = base_url.rstrip("/")
        if not self.base_url.startswith("http"):
            self.base_url = "https://" + self.base_url
        self.domain = urlparse(self.base_url).netloc
        self.max_pages = max_pages
        self.visited: set[str] = set()
        self.pages_content: Dict[str, Dict] = {}
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def is_target_page(self, url: str) -> bool:
        path = urlparse(url).path.lower()
        return any(re.search(pattern, path) for pattern in self.TARGET_PATTERNS)

    def _parse_sitemap(self, content: bytes, url: str) -> List[str]:
        """Parse sitemap XML and return URLs. Handles both sitemap and sitemap index."""
        urls: List[str] = []
        try:
            root = ET.fromstring(content)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            for elem in root.iter():
                tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
                if tag == "loc" and elem.text:
                    text = elem.text.strip()
                    if text.endswith(".xml") and "sitemap" in text.lower():
                        # Nested sitemap - fetch and recurse
                        try:
                            resp = requests.get(text, headers=self.headers, timeout=10)
                            if resp.status_code == 200:
                                urls.extend(self._parse_sitemap(resp.content, text))
                        except Exception:
                            pass
                    else:
                        urls.append(text)
        except ET.ParseError:
            pass
        return urls

    def get_sitemap_urls(self) -> List[str]:
        """Discover URLs from sitemap(s). Supports sitemap index and nested sitemaps."""
        urls: List[str] = []
        candidates = [
            f"{self.base_url}/sitemap.xml",
            f"{self.base_url}/sitemap_index.xml",
            f"{self.base_url}/sitemap-index.xml",
            f"{self.base_url}/sitemap1.xml",
        ]
        for sitemap_url in candidates:
            try:
                response = requests.get(sitemap_url, headers=self.headers, timeout=10)
                if response.status_code == 200:
                    found = self._parse_sitemap(response.content, sitemap_url)
                    urls.extend(found)
                    if urls:
                        break
            except Exception:
                continue
        return list(dict.fromkeys(urls))

    def discover_pages(self) -> List[str]:
        """Discover target pages from sitemap and homepage links."""
        discovered: set[str] = set()

        for url in self.get_sitemap_urls():
            if self.is_target_page(url) and urlparse(url).netloc == self.domain:
                discovered.add(url)

        try:
            response = requests.get(self.base_url, headers=self.headers, timeout=10)
            soup = BeautifulSoup(response.text, "lxml")
            for link in soup.find_all("a", href=True):
                full_url = urljoin(self.base_url, link["href"])
                parsed = urlparse(full_url)
                if parsed.netloc == self.domain and self.is_target_page(full_url):
                    discovered.add(full_url)
        except Exception:
            pass

        for path in [
            "/customers",
            "/pricing",
            "/case-studies",
            "/testimonials",
            "/about",
            "/solutions",
        ]:
            discovered.add(f"{self.base_url}{path}")

        return list(discovered)[: self.max_pages]

    def fetch_page(self, url: str) -> Optional[Dict]:
        """Fetch page, extract raw HTML, clean content, and extract structured data."""
        if url in self.visited:
            return None
        self.visited.add(url)
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            if response.status_code != 200:
                return None
            html = response.text
            soup = BeautifulSoup(html, "lxml")
            clean_text = trafilatura.extract(html, include_comments=False) or ""

            testimonials = []
            for elem in (
                soup.find_all(class_=re.compile(r"testimonial|quote|review", re.I))
                + soup.find_all("blockquote")
            ):
                text = elem.get_text(strip=True)
                if len(text) > 30:
                    cite = elem.find(["cite", "footer", "figcaption"])
                    testimonials.append(
                        {
                            "quote": text[:500],
                            "attribution": cite.get_text(strip=True) if cite else "",
                        }
                    )

            logos = []
            for section in soup.find_all(
                class_=re.compile(r"logo|customer|client|partner", re.I)
            ):
                for img in section.find_all("img"):
                    alt = img.get("alt", "")
                    if alt and len(alt) < 50:
                        name = re.sub(r"\s*(logo|icon)\s*$", "", alt, flags=re.I).strip()
                        if name:
                            logos.append(name)

            pricing = {"tiers": [], "raw_text": ""}
            pricing_section = soup.find(class_=re.compile(r"pricing|plans?", re.I))
            if pricing_section:
                pricing["raw_text"] = pricing_section.get_text(strip=True)[:2000]
                pricing["tiers"] = list(
                    set(
                        re.findall(
                            r"\$[\d,]+(?:\.\d{2})?(?:/mo|/month|/yr)?",
                            pricing_section.get_text(),
                        )
                    )
                )

            return {
                "url": url,
                "title": soup.title.string if soup.title else "",
                "raw_html": html[:50000],
                "clean_text": clean_text,
                "testimonials": testimonials[:20],
                "logos": list(set(logos)),
                "pricing": pricing,
            }
        except Exception:
            return None

    def crawl(self) -> Dict[str, Dict]:
        """Crawl discovered pages and return content."""
        pages = self.discover_pages()
        for url in pages:
            content = self.fetch_page(url)
            if content:
                self.pages_content[url] = content
            time.sleep(0.5)
        return self.pages_content
