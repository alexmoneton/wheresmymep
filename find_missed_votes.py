#!/usr/bin/env python3
"""
Find the specific votes that Malika Sorel missed
"""

import pandas as pd
import requests
import time
from bs4 import BeautifulSoup
import re

def find_missed_votes():
    """Find the votes that Malika Sorel missed"""
    
    # Load MEP data
    meps_df = pd.read_csv('data/meps_attendance.csv')
    malika = meps_df[meps_df['name'] == 'Malika Sorel'].iloc[0]
    
    print(f"Malika Sorel (MEP ID: {malika['mep_id']})")
    print(f"Total votes: {malika['votes_total_period']}")
    print(f"Votes cast: {malika['votes_cast']}")
    print(f"Attendance: {malika['attendance_pct']}%")
    print(f"Missed votes: {malika['votes_total_period'] - malika['votes_cast']}")
    print()
    
    # Load votes catalog to get all votes
    votes_df = pd.read_csv('data/votes_catalog.csv')
    print(f"Total votes in catalog: {len(votes_df)}")
    
    # Get Malika's notable votes (votes she participated in)
    notable_df = pd.read_csv('data/mep_notable_votes.csv')
    malika_votes = notable_df[notable_df['mep_id'] == malika['mep_id']]
    
    print(f"Malika's notable votes: {len(malika_votes)}")
    
    # Find votes she missed by comparing all votes with her notable votes
    all_vote_ids = set(votes_df['vote_id'].astype(str))
    malika_vote_ids = set(malika_votes['vote_id'].astype(str))
    
    missed_vote_ids = all_vote_ids - malika_vote_ids
    
    print(f"Votes she missed: {len(missed_vote_ids)}")
    
    if len(missed_vote_ids) <= 10:  # If reasonable number, show details
        print("\nMissed votes:")
        for vote_id in sorted(missed_vote_ids):
            vote_info = votes_df[votes_df['vote_id'].astype(str) == vote_id]
            if not vote_info.empty:
                vote = vote_info.iloc[0]
                print(f"  Vote {vote_id}: {vote['title']} ({vote['vote_date']})")
                print(f"    Result: {vote['result']}")
                print(f"    URL: {vote['source_url']}")
                print()
    
    # Let's also check if we can find her in the raw vote data
    print("Checking for Malika Sorel in vote data...")
    
    # Try to find her participation in some recent votes
    recent_votes = votes_df.tail(10)
    for _, vote in recent_votes.iterrows():
        print(f"\nChecking Vote {vote['vote_id']}: {vote['title']}")
        print(f"Date: {vote['vote_date']}")
        print(f"URL: {vote['source_url']}")
        
        # Try to fetch the vote details
        try:
            response = requests.get(vote['source_url'], timeout=10)
            if response.status_code == 200:
                # Look for Malika Sorel in the response
                if 'Malika Sorel' in response.text:
                    print("  ✅ Malika Sorel found in this vote")
                else:
                    print("  ❌ Malika Sorel NOT found in this vote")
            else:
                print(f"  ⚠️  Could not fetch vote details (status: {response.status_code})")
        except Exception as e:
            print(f"  ⚠️  Error fetching vote: {e}")
        
        time.sleep(1)  # Rate limiting

if __name__ == "__main__":
    find_missed_votes()
