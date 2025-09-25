#!/usr/bin/env python3
"""
Find the specific 2 votes that Malika Sorel missed
"""

import pandas as pd

def find_specific_missed_votes():
    """Find the specific votes that Malika Sorel missed"""
    
    # Load data
    votes_df = pd.read_csv('data/votes_catalog.csv')
    notable_df = pd.read_csv('data/mep_notable_votes.csv')
    
    # Malika's MEP ID
    malika_id = 256871
    malika_votes = notable_df[notable_df['mep_id'] == malika_id]
    
    print("Malika Sorel's notable votes (all from July 10, 2025):")
    for _, vote in malika_votes.sort_values('vote_date').iterrows():
        print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:60]}...")
    
    print(f"\nVotes after Malika's last notable vote (July 10, 12:17:02):")
    
    # Find votes after her last notable vote
    last_vote_time = "2025-07-10 12:17:02"
    late_votes = votes_df[pd.to_datetime(votes_df['vote_date']) > pd.to_datetime(last_vote_time)]
    
    print(f"Found {len(late_votes)} votes after her last participation:")
    for _, vote in late_votes.iterrows():
        print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:60]}...")
        print(f"    Result: {vote['result']}")
        print(f"    URL: {vote['source_url']}")
        print()
    
    # Also check if there are votes from early in the period (March) that she missed
    print("Checking for votes from early in the period (March 13, 2025):")
    early_votes = votes_df[pd.to_datetime(votes_df['vote_date']).dt.date == pd.to_datetime('2025-03-13').date()]
    print(f"Found {len(early_votes)} votes from March 13, 2025")
    
    # Show a few early votes
    print("Sample early votes (March 13):")
    for _, vote in early_votes.head(5).iterrows():
        print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:60]}...")
        print(f"    Result: {vote['result']}")
        print(f"    URL: {vote['source_url']}")
        print()
    
    # Based on the pattern, the 2 missed votes are likely:
    # 1. One or more votes from March 13 (early in the period)
    # 2. One or more votes from July 10 after 12:17:02 (late in the day)
    
    print("CONCLUSION:")
    print("Malika Sorel missed 2 votes:")
    print("1. Likely one or more votes from March 13, 2025 (early in the 180-day period)")
    print("2. Likely one or more votes from July 10, 2025 after 12:17:02 (late in the day)")
    print()
    print("The most likely candidates are:")
    print("- Votes 178225, 178228, 178229, 178230, or 178231 (July 10, after 12:17:02)")
    print("- Votes from March 13, 2025 (early in the period)")

if __name__ == "__main__":
    find_specific_missed_votes()
