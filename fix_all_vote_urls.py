#!/usr/bin/env python3
"""
Script to fix vote record URLs in both votes catalog and notable votes.
Converts XML URLs to user-friendly web interface URLs.
"""

import pandas as pd
import re

def fix_vote_urls():
    """Fix vote record URLs to be user-friendly."""
    
    # Fix votes catalog
    print("🔧 Fixing votes_catalog.csv...")
    df_votes = pd.read_csv('data/votes_catalog.csv')
    print(f"Original votes catalog: {len(df_votes)} votes")
    
    # Fix notable votes
    print("🔧 Fixing mep_notable_votes.csv...")
    df_notable = pd.read_csv('data/mep_notable_votes.csv')
    print(f"Original notable votes: {len(df_notable)} records")
    
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
                    year = 2025  # Default to 2025 if parsing fails
            else:
                year = 2025
            
            # Convert to user-friendly URL
            # The European Parliament has a web interface for votes
            return f"https://www.europarl.europa.eu/plenary/en/votes.html?date={year}&vote={vote_id}"
        
        return xml_url
    
    # Fix votes catalog
    changes_votes = 0
    for index, row in df_votes.iterrows():
        original_url = row['source_url']
        vote_date = row['vote_date']
        new_url = convert_vote_url(original_url, vote_date)
        
        if new_url != original_url:
            df_votes.at[index, 'source_url'] = new_url
            changes_votes += 1
            if changes_votes <= 3:  # Show first 3 examples
                print(f"✅ Votes catalog - Vote {row['vote_id']}: {original_url} → {new_url}")
    
    # Fix notable votes
    changes_notable = 0
    for index, row in df_notable.iterrows():
        original_url = row['source_url']
        vote_date = row['vote_date']
        new_url = convert_vote_url(original_url, vote_date)
        
        if new_url != original_url:
            df_notable.at[index, 'source_url'] = new_url
            changes_notable += 1
            if changes_notable <= 3:  # Show first 3 examples
                print(f"✅ Notable votes - Vote {row['vote_id']}: {original_url} → {new_url}")
    
    print(f"\n📊 Summary:")
    print(f"- Votes catalog: {len(df_votes)} votes, {changes_votes} URLs updated")
    print(f"- Notable votes: {len(df_notable)} records, {changes_notable} URLs updated")
    
    # Save the corrected data
    df_votes.to_csv('data/votes_catalog.csv', index=False)
    df_notable.to_csv('data/mep_notable_votes.csv', index=False)
    print(f"✅ Updated data saved to both CSV files")
    
    # Show a few examples of the new URLs
    print(f"\n🔗 Sample of new URLs from notable votes:")
    for i, row in df_notable.head(3).iterrows():
        print(f"  Vote {row['vote_id']}: {row['source_url']}")

if __name__ == "__main__":
    fix_vote_urls()
