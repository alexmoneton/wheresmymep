// JSON-LD structured data helpers for pSEO

export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

export function collectionLd(name: string, url: string, itemUrls: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemUrls.length,
      itemListElement: itemUrls.map((itemUrl, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: itemUrl
      }))
    }
  }
}

export interface ArticleData {
  headline: string
  datePublished: string
  author?: string
  mainEntityOfPage: string
  description?: string
  image?: string
}

export function articleLd(data: ArticleData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    datePublished: data.datePublished,
    author: data.author ? {
      '@type': 'Organization',
      name: data.author
    } : undefined,
    mainEntityOfPage: data.mainEntityOfPage,
    description: data.description,
    image: data.image,
    publisher: {
      '@type': 'Organization',
      name: "Where's My MEP?",
      url: process.env.APP_URL || 'https://wheresmymep.eu'
    }
  }
}

export interface ItemListData {
  name: string
  items: Array<{
    position: number
    url: string
    name: string
  }>
}

export function itemListLd(data: ItemListData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.name,
    numberOfItems: data.items.length,
    itemListElement: data.items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url
    }))
  }
}

export interface PersonData {
  name: string
  jobTitle?: string
  worksFor?: string
  address?: {
    addressCountry: string
  }
  sameAs?: string[]
  additionalProperty?: Array<{
    name: string
    value: string | number
  }>
}

export function personLd(data: PersonData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    jobTitle: data.jobTitle || 'Member of the European Parliament',
    worksFor: data.worksFor ? {
      '@type': 'Organization',
      name: data.worksFor
    } : {
      '@type': 'Organization',
      name: 'European Parliament'
    },
    address: data.address,
    sameAs: data.sameAs,
    additionalProperty: data.additionalProperty?.map(prop => ({
      '@type': 'PropertyValue',
      name: prop.name,
      value: prop.value
    }))
  }
}

export interface NewsArticleData {
  headline: string
  datePublished: string
  dateModified?: string
  author?: string
  mainEntityOfPage: string
  description?: string
  articleSection?: string
}

export function newsArticleLd(data: NewsArticleData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: data.headline,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: data.author ? {
      '@type': 'Organization',
      name: data.author
    } : undefined,
    mainEntityOfPage: data.mainEntityOfPage,
    description: data.description,
    articleSection: data.articleSection,
    publisher: {
      '@type': 'Organization',
      name: "Where's My MEP?",
      url: process.env.APP_URL || 'https://wheresmymep.eu'
    }
  }
}

// Helper to render JSON-LD script tag
export function renderJsonLd(data: any): string {
  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`
}
