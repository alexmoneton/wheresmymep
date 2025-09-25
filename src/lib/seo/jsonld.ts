interface Person {
  firstName: string;
  lastName: string;
  country: { name: string };
  party?: { name: string; abbreviation?: string };
  committees?: Array<{ name: string; role: string }>;
  photoUrl?: string;
  twitter?: string;
  website?: string;
}

interface Organization {
  name: string;
  description?: string;
  url?: string;
  logo?: string;
}

interface CollectionPage {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}

interface Dataset {
  name: string;
  description: string;
  url: string;
  dateModified: string;
  publisher: Organization;
}

export function generatePersonJSONLD(person: Person, baseUrl: string) {
  const fullName = `${person.firstName} ${person.lastName}`;
  const slug = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const jsonld: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": fullName,
    "givenName": person.firstName,
    "familyName": person.lastName,
    "nationality": person.country.name,
    "url": `${baseUrl}/meps/${slug}`,
    "jobTitle": "Member of the European Parliament",
    "worksFor": {
      "@type": "Organization",
      "name": "European Parliament",
      "url": "https://www.europarl.europa.eu"
    },
    "memberOf": []
  };
  
  // Add party membership
  if (person.party) {
    jsonld.memberOf.push({
      "@type": "Organization",
      "name": person.party.name,
      "alternateName": person.party.abbreviation,
      "description": "European Parliament Political Group"
    });
  }
  
  // Add committee memberships
  if (person.committees) {
    for (const committee of person.committees) {
      jsonld.memberOf.push({
        "@type": "Organization",
        "name": committee.name,
        "description": `European Parliament ${committee.name} Committee`,
        "member": {
          "@type": "Person",
          "name": fullName,
          "roleName": committee.role
        }
      });
    }
  }
  
  // Add additional properties
  if (person.photoUrl) {
    jsonld["image"] = {
      "@type": "ImageObject",
      "url": person.photoUrl,
      "caption": `Official photo of ${fullName}`
    };
  }
  
  const sameAs = [];
  if (person.twitter) {
    sameAs.push(`https://twitter.com/${person.twitter}`);
  }
  if (person.website) {
    sameAs.push(person.website);
  }
  if (sameAs.length > 0) {
    jsonld["sameAs"] = sameAs;
  }
  
  return jsonld;
}

export function generateOrganizationJSONLD(organization: Organization, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organization.name,
    "description": organization.description,
    "url": organization.url || baseUrl,
    "logo": organization.logo || `${baseUrl}/favicon.svg`,
    "sameAs": [
      "https://twitter.com/wheresmymep",
      "https://github.com/wheresmymep"
    ]
  };
}

export function generateCollectionPageJSONLD(collection: CollectionPage, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collection.name,
    "description": collection.description,
    "url": collection.url,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": collection.numberOfItems || 0
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Where's My MEP?",
      "url": baseUrl
    }
  };
}

export function generateDatasetJSONLD(dataset: Dataset, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": dataset.name,
    "description": dataset.description,
    "url": dataset.url,
    "dateModified": dataset.dateModified,
    "publisher": dataset.publisher,
    "license": "https://opendatacommons.org/licenses/odbl/",
    "keywords": [
      "European Parliament",
      "MEP",
      "voting",
      "attendance",
      "democracy",
      "transparency"
    ],
    "distribution": {
      "@type": "DataDownload",
      "contentUrl": `${baseUrl}/api/v1/meps`,
      "encodingFormat": "application/json"
    }
  };
}

export function generateBreadcrumbJSONLD(items: Array<{ name: string; url: string }>, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

export function generateWebSiteJSONLD(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Where's My MEP?",
    "description": "Track attendance rates and voting records of Members of the European Parliament",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/meps?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Where's My MEP?",
      "url": baseUrl
    }
  };
}
