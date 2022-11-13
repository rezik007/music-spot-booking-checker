import fetch from 'node-fetch';
import nodeCron from 'node-cron';
import dayjs from 'dayjs';
import notifier from 'node-notifier';

const ROOM_ID = 1;
const DATE_API_FORMAT = 'YYYY-MM-DD';

let PREVIOUS_NUMBER_OF_RESERVATIONS = 0;

const getSystemUrl = (from, to) => `https://dzwiekowa.pl/system-rezerwacji/api/reservations?from=${from}&to=${to}&scope=active`;

const fetchApiData = async () => {
  const fromDate = dayjs().format(DATE_API_FORMAT);
  const toDate = dayjs().add(1, 'day').format(DATE_API_FORMAT);
  const response = await fetch(getSystemUrl(fromDate, toDate));
  const data = await response.json();

  const singleRoomBookings = data.reservations.filter(booking => booking.roomId === ROOM_ID);

  console.log('List of bookings: ', singleRoomBookings);
  console.log('Previous number of bookings: ', PREVIOUS_NUMBER_OF_RESERVATIONS);
  console.log('Current number of bookings: ', singleRoomBookings.length);

  if (singleRoomBookings.length < PREVIOUS_NUMBER_OF_RESERVATIONS) {
    notifier.notify({
      title: 'Salka sie zwolniła!',
      message: 'Czas na próbę ziomuś',
    });
  }

  if (singleRoomBookings.length > PREVIOUS_NUMBER_OF_RESERVATIONS) {
    notifier.notify({
      title: 'Na salce ktoś zaklepał probę!',
      message: 'No to peszek',
    });
  }

  PREVIOUS_NUMBER_OF_RESERVATIONS = singleRoomBookings.length;
}

const job = nodeCron.schedule("*/10 * * * *", function jobYouNeedToExecute() {
  console.log('EXECUTED AT', dayjs().format(`${DATE_API_FORMAT} HH:mm`));
  fetchApiData();
});

job.start();
