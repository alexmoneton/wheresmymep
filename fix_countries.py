#!/usr/bin/env python3
"""
Script to fix country mappings in MEP data.
Maps birth countries to representation countries based on research.
"""

import pandas as pd
import re

# Country mapping based on research
COUNTRY_MAPPINGS = {
    # Non-EU countries -> EU representation countries
    'Albania': 'Greece',  # Fredis Beleris represents Greece
    'United States': 'Ireland',  # Maria Walsh represents Ireland (Fine Gael)
    'Ukraine': 'Romania',  # Eugen Tomac represents Romania
    'Tunisia': 'France',  # Leïla Chaibi represents France (La France insoumise)
    'State of Palestine': 'France',  # Rima Hassan represents France (La France insoumise)
    'Morocco': 'France',  # Sarah Knafo represents France (Reconquête)
    'Burkina Faso': 'Belgium',  # Assita Kanko represents Belgium (New Flemish Alliance)
    'Bosnia and Herzegovina': 'Croatia',  # Željana Zovko represents Croatia
    'Algeria': 'France',  # Malika Sorel represents France (National Rally)
    
    # Historical countries -> current EU countries
    'Soviet Union': {
        'Andrius Kubilius': 'Lithuania',  # Lithuanian name, Homeland Union party
        'Rasa Juknevičienė': 'Lithuania',  # Lithuanian name, Homeland Union party
        'Viktória Ferenc': 'Hungary',  # Hungarian name, Fidesz party
        'Vilis Krištopans': 'Latvia',  # Latvian name, Union of Greens and Farmers
        'Vytenis Andriukaitis': 'Lithuania',  # Lithuanian name, Social Democratic Party
    },
    'Socialist Federal Republic of Yugoslavia': {
        'Annamária Vicsek': 'Hungary',  # Hungarian name, Alliance of Vojvodina Hungarians
        'Nikolina Brnjac': 'Croatia',  # Croatian name, Croatian Democratic Union
    },
    'German Democratic Republic': {
        'Marion Walsmann': 'Germany',  # German name, Christian Democratic Union
        'Sibylle Berg': 'Germany',  # German name
    },
    'Polish People\'s Republic': {
        'Piotr Müller': 'Poland',  # Polish name, Law and Justice party
    }
}

def fix_countries():
    """Fix country mappings in the MEP data."""
    
    # Read the CSV file
    df = pd.read_csv('data/meps.csv')
    
    print(f"Original data: {len(df)} MEPs")
    
    # Apply country mappings
    changes_made = 0
    
    for index, row in df.iterrows():
        original_country = row['country']
        name = row['name']
        
        # Check for direct country mapping
        if original_country in COUNTRY_MAPPINGS:
            if isinstance(COUNTRY_MAPPINGS[original_country], dict):
                # Historical country with name-specific mappings
                if name in COUNTRY_MAPPINGS[original_country]:
                    new_country = COUNTRY_MAPPINGS[original_country][name]
                    df.at[index, 'country'] = new_country
                    print(f"✅ {name}: {original_country} → {new_country}")
                    changes_made += 1
                else:
                    print(f"⚠️  {name}: No mapping found for {original_country}")
            else:
                # Direct country mapping
                new_country = COUNTRY_MAPPINGS[original_country]
                df.at[index, 'country'] = new_country
                print(f"✅ {name}: {original_country} → {new_country}")
                changes_made += 1
    
    print(f"\n📊 Summary:")
    print(f"- Total MEPs: {len(df)}")
    print(f"- Changes made: {changes_made}")
    
    # Save the corrected data
    df.to_csv('data/meps.csv', index=False)
    print(f"✅ Updated data saved to data/meps.csv")
    
    # Show country distribution after fixes
    print(f"\n🌍 Country distribution after fixes:")
    country_counts = df['country'].value_counts()
    for country, count in country_counts.head(10).items():
        print(f"  {country}: {count}")

if __name__ == "__main__":
    fix_countries()
