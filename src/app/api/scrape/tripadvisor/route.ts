import { NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.goto(`https://www.tripadvisor.com/Search?q=${encodeURIComponent(query)}&searchType=destination`)

    // Wait for results to load
    await page.waitForSelector('.location-meta-block')

    // Extract destination data
    const destinations = await page.evaluate(() => {
      const results = []
      const elements = document.querySelectorAll('.location-meta-block')
      
      elements.forEach((el) => {
        const nameEl = el.querySelector('.result-title')
        const descriptionEl = el.querySelector('.result-description')
        const imageEl = el.querySelector('img')
        const ratingEl = el.querySelector('.ui_bubble_rating')
        
        if (nameEl) {
          const name = nameEl.textContent?.trim() || ''
          const country = name.split(',').pop()?.trim() || ''
          
          results.push({
            name: name.split(',')[0].trim(),
            country,
            description: descriptionEl?.textContent?.trim() || '',
            image: imageEl?.getAttribute('src') || '',
            type: [], // Would need additional processing to determine type
            rating: ratingEl ? parseFloat(ratingEl.getAttribute('alt')?.split(' ')[0] || '0') : 0,
            reviews: 0, // Would need additional processing
            priceRange: '', // Would need additional processing
            bestTimeToVisit: '', // Would need additional processing
            weather: {
              summer: '',
              winter: ''
            },
            highlights: [], // Would need additional processing
            source: 'TripAdvisor',
            url: nameEl.getAttribute('href') || ''
          })
        }
      })
      
      return results
    })

    await browser.close()

    return NextResponse.json(destinations)
  } catch (error) {
    console.error('Error scraping TripAdvisor:', error)
    return NextResponse.json({ error: 'Failed to scrape TripAdvisor' }, { status: 500 })
  }
} 