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
    await page.goto(`https://www.lonelyplanet.com/search?q=${encodeURIComponent(query)}`)

    // Wait for results to load
    await page.waitForSelector('.destination-card')

    // Extract destination data
    const destinations = await page.evaluate(() => {
      const results: Array<{
        name: string
        country: string
        description: string
        image: string
        type: string[]
        rating: number
        reviews: number
        priceRange: string
        bestTimeToVisit: string
        weather: {
          summer: string
          winter: string
        }
        highlights: string[]
        source: string
        url: string
      }> = []

      const elements = document.querySelectorAll('.destination-card')
      
      elements.forEach((el) => {
        const nameEl = el.querySelector('.destination-card__title')
        const descriptionEl = el.querySelector('.destination-card__description')
        const imageEl = el.querySelector('img')
        const typeEl = el.querySelector('.destination-card__type')
        
        if (nameEl) {
          const name = nameEl.textContent?.trim() || ''
          const country = name.split(',').pop()?.trim() || ''
          
          results.push({
            name: name.split(',')[0].trim(),
            country,
            description: descriptionEl?.textContent?.trim() || '',
            image: imageEl?.getAttribute('src') || '',
            type: typeEl ? [typeEl.textContent?.trim() || ''] : [],
            rating: 0, // Would need additional processing
            reviews: 0, // Would need additional processing
            priceRange: '', // Would need additional processing
            bestTimeToVisit: '', // Would need additional processing
            weather: {
              summer: '',
              winter: ''
            },
            highlights: [], // Would need additional processing
            source: 'Lonely Planet',
            url: nameEl.getAttribute('href') || ''
          })
        }
      })
      
      return results
    })

    await browser.close()

    return NextResponse.json(destinations)
  } catch (error) {
    console.error('Error scraping Lonely Planet:', error)
    return NextResponse.json({ error: 'Failed to scrape Lonely Planet' }, { status: 500 })
  }
} 