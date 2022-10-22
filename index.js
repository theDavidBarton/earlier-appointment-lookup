const puppeteer = require('puppeteer')

const runScrape = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(process.env.TARGET_URL)
  const availableDates = await page.$$eval('.closest_cal button', dates =>
    dates.map(el => Date.parse(el.innerText)).filter(Boolean)
  )
  const isThereEarlier = availableDates.some(date => date < 1668614400000) // 11/16/2022, 5:00:00 PM
  console.log('IS THERE AN APPOINTMENT EARLIER THAN 11/16/2022, 5:00:00 PM: ' + isThereEarlier)
  const availableDatesFormatted = availableDates.map(el => new Date(el).toLocaleString())
  console.log(availableDatesFormatted)
  if (isThereEarlier) {
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL_USERNAME,
        pass: process.env.SENDER_EMAIL_PASSWORD
      }
    })

    const mailOptions = {
      from: process.env.SENDER_EMAIL_USERNAME,
      to: process.env.RECEIVER_EMAIL_USERNAME,
      subject: 'An earlier appointment has become availble on ' + availableDatesFormatted[0],
      text: `Hi, 
      
      Your followed appointment got an earlier available date:
      ${availableDatesFormatted[0]}
      
      Other dates:
      ${availableDatesFormatted}
      
      
      Cheers,
      Your Friends at Earlier Appointment Lookup app`
    }

    transporter.sendMail(mailOptions, (e, info) => (!e ? console.log('Email sent: ' + info.response) : console.error(e)))
  } else {
    console.log('NOTHING NEW TODAY')
  }
  await browser.close()
}
runScrape()
