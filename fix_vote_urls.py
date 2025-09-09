#!/usr/bin/env python3
"""
Script to fix vote record URLs in the votes catalog.
Converts XML URLs to user-friendly web interface URLs.
"""

import pandas as pd
import re

def fix_vote_urls():
    """Fix vote record URLs to be user-friendly."""
    
    # Read the votes catalog
    df = pd.read_csv('data/votes_catalog.csv')
    
    print(f"Original data: {len(df)} votes")
    
    # Function to convert XML URL to user-friendly URL
    def convert_vote_url(xml_url, vote_date):
        """Convert XML vote URL to user-friendly URL."""
        if pd.isna(xml_url) or not xml_url:
            return xml_url
            
        # Extract vote ID from XML URL
        # Example: https://www.europarl.europa.eu/plenary/en/votes/172886.xml
        match = re.search(r'/votes/(\d+)\.xml', xml_url)
        if match:
            vote_id = match.group(1)
            
            # Extract year from vote date
            if pd.notna(vote_date):
                try:
                    # Parse date and extract year
                    year = pd.to_datetime(vote_date).year
                except:
                    year = 2024  # Default to 2024 if parsing fails
            else:
                year = 2024
            
            # Convert to user-friendly URL
            # The European Parliament has a web interface for votes
            return f"https://www.europarl.europa.eu/plenary/en/votes.html?date={year}&vote={vote_id}"
        
        return xml_url
    
    # Apply URL conversion
    changes_made = 0
    for index, row in df.iterrows():
        original_url = row['source_url']
        vote_date = row['vote_date']
        new_url = convert_vote_url(original_url, vote_date)
        
        if new_url != original_url:
            df.at[index, 'source_url'] = new_url
            changes_made += 1
            if changes_made <= 5:  # Show first 5 examples
                print(f"✅ Vote {row['vote_id']}: {original_url} → {new_url}")
    
    print(f"\n📊 Summary:")
    print(f"- Total votes: {len(df)}")
    print(f"- URLs updated: {changes_made}")
    
    # Save the corrected data
    df.to_csv('data/votes_catalog.csv', index=False)
    print(f"✅ Updated data saved to data/votes_catalog.csv")
    
    # Show a few examples of the new URLs
    print(f"\n🔗 Sample of new URLs:")
    for i, row in df.head(3).iterrows():
        print(f"  Vote {row['vote_id']}: {row['source_url']}")

if __name__ == "__main__":
    fix_vote_urls()
