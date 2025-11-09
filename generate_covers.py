"""
Script to generate portfolio cover images using DALL-E 3
"""

import os
from openai import OpenAI
import requests
from pathlib import Path

# Initialize OpenAI client with API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")

client = OpenAI(api_key=OPENAI_API_KEY)

# Output directory for the covers
output_dir = Path(r"F:\OneDrive - University of Missouri\IS_LT-7355\assets\coverflow")
output_dir.mkdir(parents=True, exist_ok=True)

# Define the covers to generate
covers = [
    {
        "filename": "coverflow_portfolio_resume.png",
        "title": "Portfolio Resume",
        "prompt": """A modern professional cover image for a technology education portfolio resume section. 
        NO TEXT OR WORDS in the image.
        Dark navy blue to teal gradient background (#060714 to dark teal). 
        Abstract illustrations of a professional resume document with data visualizations, bar charts, line graphs, 
        pie charts, and educational technology icons in teal and pink/coral accents.
        Include subtle blue corner brackets as frame elements in all four corners. 
        Modern, clean, minimalist design with geometric shapes.
        Style: flat design illustration, professional, tech-forward, abstract."""
    },
    {
        "filename": "coverflow_portfolio_program_of_study.png",
        "title": "Program of Study",
        "prompt": """A modern professional cover image for a technology education program of study section.
        NO TEXT OR WORDS in the image.
        Dark navy blue to teal gradient background (#060714 to dark teal).
        Abstract illustrations of academic books, graduation cap, connected nodes and pathways representing coursework, 
        network diagrams, and technology learning symbols in teal and pink/coral accents.
        Include subtle blue corner brackets as frame elements in all four corners.
        Modern, clean, minimalist design with geometric shapes.
        Style: flat design illustration, professional, tech-forward, abstract."""
    },
    {
        "filename": "coverflow_portfolio_reflection_statement.png",
        "title": "Reflection Statement",
        "prompt": """A modern professional cover image for a reflection and learning journey section.
        NO TEXT OR WORDS in the image.
        Dark navy blue to teal gradient background (#060714 to dark teal).
        Abstract illustrations of lightbulbs representing ideas, upward growth arrows, 
        connected thought bubbles, gears, stars, and learning symbols in teal and pink/coral accents.
        Include subtle blue corner brackets as frame elements in all four corners.
        Modern, clean, minimalist design with geometric shapes.
        Style: flat design illustration, professional, tech-forward, abstract."""
    },
    {
        "filename": "coverflow_portfolio_program_goals.png",
        "title": "Program Goals & Outcomes",
        "prompt": """A modern professional cover image for program goals and outcomes section.
        NO TEXT OR WORDS in the image.
        Dark navy blue to teal gradient background (#060714 to dark teal).
        Abstract illustrations of target/bullseye icons, trophy or achievement badges, checkmarks, 
        ascending arrows, goal pathways with connecting lines, success symbols in teal and pink/coral accents.
        Include subtle blue corner brackets as frame elements in all four corners.
        Modern, clean, minimalist design with geometric shapes.
        Style: flat design illustration, professional, tech-forward, abstract."""
    }
]

def generate_cover(cover_info):
    """Generate a single cover image using DALL-E 3"""
    print(f"\n{'='*60}")
    print(f"Generating: {cover_info['title']}")
    print(f"{'='*60}")
    
    try:
        # Generate image using DALL-E 3
        response = client.images.generate(
            model="dall-e-3",
            prompt=cover_info['prompt'],
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        # Get the image URL
        image_url = response.data[0].url
        print(f"[SUCCESS] Image generated successfully")
        print(f"  URL: {image_url}")
        
        # Download the image
        image_response = requests.get(image_url)
        if image_response.status_code == 200:
            output_path = output_dir / cover_info['filename']
            with open(output_path, 'wb') as f:
                f.write(image_response.content)
            print(f"[SUCCESS] Saved to: {output_path}")
            return True
        else:
            print(f"[FAILED] Failed to download image: {image_response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error generating cover: {str(e)}")
        return False

def main():
    """Main function to generate all covers"""
    print("\n" + "="*60)
    print("DALL-E 3 Portfolio Cover Generator")
    print("="*60)
    print(f"Output directory: {output_dir}")
    print(f"Covers to generate: {len(covers)}")
    
    results = []
    for cover in covers:
        success = generate_cover(cover)
        results.append((cover['title'], success))
    
    # Summary
    print("\n" + "="*60)
    print("GENERATION SUMMARY")
    print("="*60)
    for title, success in results:
        status = "[SUCCESS]" if success else "[FAILED]"
        print(f"{status}: {title}")
    
    successful = sum(1 for _, success in results if success)
    print(f"\nTotal: {successful}/{len(results)} covers generated successfully")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
