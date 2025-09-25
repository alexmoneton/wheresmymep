#!/usr/bin/env python3
"""
Find the 2 votes that Malika Sorel missed - Efficient approach
"""

import pandas as pd

def find_missed_votes_efficient():
    """Find the votes that Malika Sorel missed using available data"""
    
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
    
    # The issue is that we only have her "notable" votes, not all votes she participated in
    # Let's look at the vote dates to understand the pattern
    
    print("\nMalika's notable votes (chronological order):")
    for _, vote in malika_votes.sort_values('vote_date').iterrows():
        print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:80]}...")
        print(f"    Her vote: {vote['vote_position']}, Result: {vote['result']}")
    
    print(f"\nAll votes in catalog (first 10, chronological order):")
    for _, vote in votes_df.sort_values('vote_date').head(10).iterrows():
        print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:80]}...")
    
    print(f"\nAll votes in catalog (last 10, chronological order):")
    for _, vote in votes_df.sort_values('vote_date').tail(10).iterrows():
        print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:80]}...")
    
    # Let's check if there are any votes from early in the period that she might have missed
    print(f"\nChecking for potential missed votes...")
    
    # Get date range
    all_dates = pd.to_datetime(votes_df['vote_date'])
    malika_dates = pd.to_datetime(malika_votes['vote_date'])
    
    print(f"Vote period: {all_dates.min()} to {all_dates.max()}")
    print(f"Malika's notable votes: {malika_dates.min()} to {malika_dates.max()}")
    
    # Check if there are votes at the very beginning or end that she might have missed
    early_votes = votes_df[pd.to_datetime(votes_df['vote_date']) <= malika_dates.min()]
    late_votes = votes_df[pd.to_datetime(votes_df['vote_date']) >= malika_dates.max()]
    
    print(f"\nVotes before Malika's first notable vote: {len(early_votes)}")
    if len(early_votes) > 0:
        print("Early votes (potential misses):")
        for _, vote in early_votes.head(5).iterrows():
            print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:60]}...")
    
    print(f"\nVotes after Malika's last notable vote: {len(late_votes)}")
    if len(late_votes) > 0:
        print("Late votes (potential misses):")
        for _, vote in late_votes.head(5).iterrows():
            print(f"  {vote['vote_date']}: Vote {vote['vote_id']} - {vote['title'][:60]}...")

if __name__ == "__main__":
    find_missed_votes_efficient()
