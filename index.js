import fetch from 'node-fetch';
import nodeCron from 'node-cron';
import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

const ROOM_ID = 1;
const DATE_API_FORMAT = 'YYYY-MM-DD';

let PREVIOUS_NUMBER_OF_RESERVATIONS = 0;

const getSystemUrl = (from, to) => `https://dzwiekowa.pl/system-rezerwacji/api/reservations?from=${from}&to=${to}&scope=active`;

const sendNotification = async () => {
  try {

    // Get Mailer To Go SMTP connection details
    let mailertogo_host     = process.env.MAILERTOGO_SMTP_HOST;
    let mailertogo_port     = process.env.MAILERTOGO_SMTP_PORT || 587;
    let mailertogo_user     = process.env.MAILERTOGO_SMTP_USER;
    let mailertogo_password = process.env.MAILERTOGO_SMTP_PASSWORD;
    let mailertogo_domain   = process.env.MAILERTOGO_DOMAIN || "mydomain.com";

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: mailertogo_host,
      port: mailertogo_port,
      requireTLS: true, // Must use STARTTLS
      auth: {
        user: mailertogo_user,
        pass: mailertogo_password,
      },
    });

    // Sender domain must match mailertogo_domain or otherwise email will not be sent
    let from = `"Sender Name" <noreply@${mailertogo_domain}>`;

    // Change to recipient email. Make sure to use a real email address in your tests to avoid hard bounces and protect your reputation as a sender.
    let to = `"Recipient Name" <rezik007@gmail.com>`;

    let subject = "Mailer To Go Test";

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: from, // Sender address, must use the Mailer To Go domain
      to: to, // Recipients
      subject: subject, // Subject line
      text: "Test from Mailer To Go 😊.", // Plain text body
      html: "Test from <b>Mailer To Go</b> 😊.", // HTML body
    });

    console.log("Message sent: %s", info.messageId);

  } catch(err) {
    console.log('Unhandled error occured during mail sending: ', err);
  }
};

const fetchApiData = async () => {
  const fromDate = dayjs().format(DATE_API_FORMAT);
  const toDate = dayjs().add(1, 'day').format(DATE_API_FORMAT);
  const response = await fetch(getSystemUrl(fromDate, toDate));
  const data = await response.json();

  const singleRoomBookings = data.reservations.filter(booking => booking.roomId = ROOM_ID);

  console.log('singleRoomBookings', singleRoomBookings)

  // if (singleRoomBookings.length < PREVIOUS_NUMBER_OF_RESERVATIONS) {
  //   sendNotification(singleRoomBookings);
  // }

  sendNotification()

  PREVIOUS_NUMBER_OF_RESERVATIONS = singleRoomBookings.length;
}

fetchApiData();

const job = nodeCron.schedule("*/10 * * * *", function jobYouNeedToExecute() {
  // Do whatever you want in here. Send email, Make  database backup or download data.
  console.log(new Date().toLocaleString());
});

job.start();
