#!/usr/bin/env python3
"""
Generate 8.5" x 11" PDF from Math-in-Motion Executive Summary HTML

This script uses Playwright to render the HTML and generate a PDF that fits
on a single 8.5x11 page.

Requirements:
    pip install playwright
    playwright install chromium

Usage:
    python generate_executive_summary_pdf.py
"""

import asyncio
from pathlib import Path
from playwright.async_api import async_playwright


async def generate_pdf():
    # Paths
    html_path = Path("HSSU Math-in-Motion Executive Summary.html").resolve()
    pdf_path = Path("HSSU Math-in-Motion Executive Summary.pdf").resolve()
    
    if not html_path.exists():
        print(f"Error: HTML file not found: {html_path}")
        return
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Load the HTML file
        await page.goto(f"file://{html_path}")
        
        # Wait for content to render
        await page.wait_for_load_state("networkidle")
        
        # Generate PDF with 8.5" x 11" format
        await page.pdf(
            path=str(pdf_path),
            format="Letter",  # 8.5" x 11"
            print_background=True,
            margin={
                "top": "0.5in",
                "right": "0.5in", 
                "bottom": "0.5in",
                "left": "0.5in"
            },
            scale=0.85  # Scale down to fit content on one page
        )
        
        await browser.close()
        
    print(f"PDF generated successfully: {pdf_path}")


if __name__ == "__main__":
    asyncio.run(generate_pdf())
