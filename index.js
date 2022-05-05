import fetch from 'node-fetch';
import nodeCron from 'node-cron';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import dayjs from 'dayjs';

const ROOM_ID = 1;
const DATE_API_FORMAT = 'YYYY-MM-DD';

const mailer = new Mailgun(formData).client({
  username: 'rezik',
  key: process.env.MAILGUN_API_KEY,
});

let PREVIOUS_NUMBER_OF_RESERVATIONS = 0;

const getSystemUrl = (from, to) => `https://dzwiekowa.pl/system-rezerwacji/api/reservations?from=${from}&to=${to}&scope=active`;

const sendNotification = () => {
  mailer.messages.create(process.env.MAILGUN_DOMAIN, {
    from: "Drummer programmer <drummer@programmer.com>",
    to: ["rezik007@gmail.com"],
    subject: "SALKA DO WZIĘCIA",
    text: "Ale będzie grane!",
    // html: "<h1>SALKA DO WZIĘCIA</h1>"
  })
  .then(msg => console.log('Email response data: ', msg))
  .catch(err => console.log('Unhandled error occured during mail sending: ', err)); // logs any error
};

const fetchApiData = async () => {
  const fromDate = dayjs().format(DATE_API_FORMAT);
  const toDate = dayjs().add(1, 'day').format(DATE_API_FORMAT);
  const response = await fetch(getSystemUrl(fromDate, toDate));
  const data = await response.json();

  const singleRoomBookings = data.reservations.filter(booking => booking.roomId = ROOM_ID);

  if (singleRoomBookings.length < PREVIOUS_NUMBER_OF_RESERVATIONS) {
    sendNotification();
  }

  PREVIOUS_NUMBER_OF_RESERVATIONS = singleRoomBookings.length;
}


const job = nodeCron.schedule("*/10 * * * *", function jobYouNeedToExecute() {
  fetchApiData();
});

job.start();
