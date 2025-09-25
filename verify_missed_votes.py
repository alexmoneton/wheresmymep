#!/usr/bin/env python3
"""
Verify which votes Malika Sorel actually missed by checking the data more carefully
"""

import pandas as pd

def verify_missed_votes():
    """Verify which votes Malika Sorel actually missed"""
    
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
    print(f"Total votes in catalog: {len(votes_df)}")
    
    # Load Malika's notable votes
    notable_df = pd.read_csv('data/mep_notable_votes.csv')
    malika_votes = notable_df[notable_df['mep_id'] == malika['mep_id']]
    print(f"Malika's notable votes: {len(malika_votes)}")
    
    print("\nIMPORTANT CLARIFICATION:")
    print("The 'notable votes' data only contains Malika's 10 most notable votes,")
    print("NOT all the votes she participated in. She likely participated in many more votes.")
    print()
    
    # Let's look at the vote distribution
    print("Vote distribution by date:")
    vote_dates = pd.to_datetime(votes_df['vote_date']).dt.date.value_counts().sort_index()
    for date, count in vote_dates.items():
        print(f"  {date}: {count} votes")
    
    print(f"\nMalika's notable votes by date:")
    malika_dates = pd.to_datetime(malika_votes['vote_date']).dt.date.value_counts().sort_index()
    for date, count in malika_dates.items():
        print(f"  {date}: {count} votes")
    
    # The issue is that we don't have the complete voting record
    # We only have her "notable" votes, which are a subset
    print(f"\nPROBLEM IDENTIFIED:")
    print(f"- Total votes in period: {malika['votes_total_period']}")
    print(f"- Malika's notable votes: {len(malika_votes)}")
    print(f"- This means we only have {len(malika_votes)} out of {malika['votes_cast']} votes she participated in")
    print(f"- We're missing {malika['votes_cast'] - len(malika_votes)} votes she participated in")
    print(f"- We cannot determine which 2 votes she missed without the complete voting record")
    
    print(f"\nTo find the exact 2 missed votes, we would need:")
    print(f"1. The complete voting record for all MEPs (not just notable votes)")
    print(f"2. Or access to the raw vote data from the European Parliament")
    print(f"3. Or to manually check each of the 1,215 votes")
    
    print(f"\nCURRENT LIMITATION:")
    print(f"The data we have only shows Malika's 10 most 'notable' votes,")
    print(f"not her complete voting record. Without the full record,")
    print(f"we cannot accurately identify which 2 votes she missed.")

if __name__ == "__main__":
    verify_missed_votes()
