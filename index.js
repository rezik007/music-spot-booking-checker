import fetch from 'node-fetch';
import nodeCron from 'node-cron';
import dayjs from 'dayjs';

const ROOM_ID = 1;
const DATE_API_FORMAT = 'YYYY-MM-DD';

let PREVIOUS_NUMBER_OF_RESERVATIONS = 0;

const getSystemUrl = (from, to) => `https://dzwiekowa.pl/system-rezerwacji/api/reservations?from=${from}&to=${to}&scope=active`;

const sendNotification = () => {};

const fetchApiData = async () => {
  const fromDate = dayjs().format(DATE_API_FORMAT);
  const toDate = dayjs().add(1, 'day').format(DATE_API_FORMAT);
  const response = await fetch(getSystemUrl(fromDate, toDate));
  const data = await response.json();

  const singleRoomBookings = data.reservations.filter(booking => booking.roomId = ROOM_ID);

  console.log('singleRoomBookings', singleRoomBookings)

  if (singleRoomBookings.length < PREVIOUS_NUMBER_OF_RESERVATIONS) {
    sendNotification(singleRoomBookings);
  }

  PREVIOUS_NUMBER_OF_RESERVATIONS = singleRoomBookings.length;
}

fetchApiData();

const job = nodeCron.schedule("*/10 * * * *", function jobYouNeedToExecute() {
  // Do whatever you want in here. Send email, Make  database backup or download data.
  console.log(new Date().toLocaleString());
});

job.start();
