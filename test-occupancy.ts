import { getHotelTodayEnd, getEndOfDay, createHotelCheckIn, createHotelCheckOut, HOTEL_TZ } from './src/lib/dateUtils';
import { formatInTimeZone } from 'date-fns-tz';

function runTests() {
  console.log(`--- Occupancy Logic Tests (Run in TZ=${process.env.TZ || 'Local'}) ---`);

  // 1. Check-in: 1 Mehr (Oct 1) / Check-out: 2 Mehr (Oct 2)
  const checkIn1 = createHotelCheckIn('2026-10-01');
  const checkOut1 = createHotelCheckOut('2026-10-02');

  console.log(`Reservation: ${formatInTimeZone(checkIn1, 'UTC', "yyyy-MM-dd HH:mm 'UTC'")} to ${formatInTimeZone(checkOut1, 'UTC', "yyyy-MM-dd HH:mm 'UTC'")}`);
  
  // Test on Oct 1
  const oct1_end = getEndOfDay(new Date('2026-10-01T12:00:00Z')); // pass any mid-day absolute time
  const isOccupiedOct1 = checkIn1 <= oct1_end && checkOut1 > oct1_end;
  console.log(`Occupied on Oct 1? ${isOccupiedOct1} (Expected: true)`);

  // Test on Oct 2
  const oct2_end = getEndOfDay(new Date('2026-10-02T12:00:00Z'));
  const isOccupiedOct2 = checkIn1 <= oct2_end && checkOut1 > oct2_end;
  console.log(`Occupied on Oct 2? ${isOccupiedOct2} (Expected: false)`);

  // 2. Check-in: 1 Mehr / Check-out: 3 Mehr
  const checkOut3 = createHotelCheckOut('2026-10-03');
  const isOccupiedOct2_case2 = checkIn1 <= oct2_end && checkOut3 > oct2_end;
  console.log(`Occupied on Oct 2 (staying until Oct 3)? ${isOccupiedOct2_case2} (Expected: true)`);

  const oct3_end = getEndOfDay(new Date('2026-10-03T12:00:00Z'));
  const isOccupiedOct3 = checkIn1 <= oct3_end && checkOut3 > oct3_end;
  console.log(`Occupied on Oct 3? ${isOccupiedOct3} (Expected: false)`);

  // 3. Consecutive reservations overlap logic
  const req1_checkIn = createHotelCheckIn('2026-10-01');
  const req1_checkOut = createHotelCheckOut('2026-10-02');

  const req2_checkIn = createHotelCheckIn('2026-10-02');
  const req2_checkOut = createHotelCheckOut('2026-10-03');

  const overlap = req1_checkIn < req2_checkOut && req1_checkOut > req2_checkIn;
  console.log(`Overlap between 1->2 and 2->3? ${overlap} (Expected: false)`);

  // 4. Checking Active vs Upcoming categorization today
  const todayStartStr = formatInTimeZone(new Date(), HOTEL_TZ, 'yyyy-MM-dd');
  
  const checkInToday = createHotelCheckIn(todayStartStr);
  const tomorrow = new Date(new Date().getTime() + 86400000);
  const tomorrowStr = formatInTimeZone(tomorrow, HOTEL_TZ, 'yyyy-MM-dd');
  const checkOutTomorrow = createHotelCheckOut(tomorrowStr);

  const todayEnd = getHotelTodayEnd();
  
  const isActive = checkInToday <= todayEnd && checkOutTomorrow > todayEnd;
  const isUpcoming = checkInToday > todayEnd;

  console.log(`Check-in today -> Active? ${isActive} (Expected: true)`);
  console.log(`Check-in today -> Upcoming? ${isUpcoming} (Expected: false)`);
}

runTests();
