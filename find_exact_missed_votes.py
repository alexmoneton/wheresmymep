#!/usr/bin/env python3
"""
Find the exact 2 votes that Malika Sorel missed
"""

import pandas as pd
import requests
import time
import re

def find_exact_missed_votes():
    """Find the exact votes that Malika Sorel missed by checking recent votes"""
    
    # Load MEP data
    meps_df = pd.read_csv('data/meps_attendance.csv')
    malika = meps_df[meps_df['name'] == 'Malika Sorel'].iloc[0]
    
    print(f"Malika Sorel (MEP ID: {malika['mep_id']})")
    print(f"Total votes: {malika['votes_total_period']}")
    print(f"Votes cast: {malika['votes_cast']}")
    print(f"Attendance: {malika['attendance_pct']}%")
    print(f"Missed votes: {malika['votes_total_period'] - malika['votes_cast']}")
    print()
    
    # Load votes catalog
    votes_df = pd.read_csv('data/votes_catalog.csv')
    
    # Check recent votes to see which ones she missed
    print("Checking recent votes to find the 2 she missed...")
    print("(This will take a few minutes as we check each vote)")
    print()
    
    missed_votes = []
    checked = 0
    
    # Check votes in reverse chronological order (most recent first)
    for _, vote in votes_df.sort_values('vote_date', ascending=False).iterrows():
        checked += 1
        
        if checked % 50 == 0:
            print(f"Checked {checked} votes, found {len(missed_votes)} missed votes so far...")
        
        if len(missed_votes) >= 2:
            break
            
        try:
            # Fetch the vote details
            response = requests.get(vote['source_url'], timeout=10)
            if response.status_code == 200:
                # Look for Malika Sorel in the response
                if 'Malika Sorel' not in response.text:
                    missed_votes.append(vote)
                    print(f"❌ MISSED: Vote {vote['vote_id']} - {vote['title']} ({vote['vote_date']})")
                    print(f"   URL: {vote['source_url']}")
                    print()
            else:
                print(f"⚠️  Could not fetch vote {vote['vote_id']} (status: {response.status_code})")
        except Exception as e:
            print(f"⚠️  Error fetching vote {vote['vote_id']}: {e}")
        
        time.sleep(0.5)  # Rate limiting
    
    print(f"\nSummary:")
    print(f"Checked {checked} votes")
    print(f"Found {len(missed_votes)} votes that Malika Sorel missed:")
    
    for vote in missed_votes:
        print(f"  Vote {vote['vote_id']}: {vote['title']} ({vote['vote_date']})")
        print(f"    Result: {vote['result']}")
        print(f"    URL: {vote['source_url']}")
        print()

if __name__ == "__main__":
    find_exact_missed_votes()
