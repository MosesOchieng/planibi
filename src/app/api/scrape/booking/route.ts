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
    await page.goto(`https://www.booking.com/destination/city.html?ss=${encodeURIComponent(query)}`)

    // Wait for results to load
    await page.waitForSelector('.dest-suggestion-card')

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

      const elements = document.querySelectorAll('.dest-suggestion-card')
      
      elements.forEach((el) => {
        const nameEl = el.querySelector('.dest-suggestion-card__title')
        const descriptionEl = el.querySelector('.dest-suggestion-card__description')
        const imageEl = el.querySelector('img')
        const ratingEl = el.querySelector('.bui-review-score__badge')
        const reviewsEl = el.querySelector('.bui-review-score__text')
        
        if (nameEl) {
          const name = nameEl.textContent?.trim() || ''
          const country = name.split(',').pop()?.trim() || ''
          
          results.push({
            name: name.split(',')[0].trim(),
            country,
            description: descriptionEl?.textContent?.trim() || '',
            image: imageEl?.getAttribute('src') || '',
            type: [], // Would need additional processing
            rating: ratingEl ? parseFloat(ratingEl.textContent?.trim() || '0') : 0,
            reviews: reviewsEl ? parseInt(reviewsEl.textContent?.match(/\d+/)?.[0] || '0') : 0,
            priceRange: '', // Would need additional processing
            bestTimeToVisit: '', // Would need additional processing
            weather: {
              summer: '',
              winter: ''
            },
            highlights: [], // Would need additional processing
            source: 'Booking.com',
            url: nameEl.getAttribute('href') || ''
          })
        }
      })
      
      return results
    })

    await browser.close()

    return NextResponse.json(destinations)
  } catch (error) {
    console.error('Error scraping Booking.com:', error)
    return NextResponse.json({ error: 'Failed to scrape Booking.com' }, { status: 500 })
  }
} 