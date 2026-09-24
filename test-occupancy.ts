import { getTodayEnd, getTodayStart, getEndOfDay } from './src/lib/dateUtils';

function runTests() {
  console.log('--- Occupancy Logic Tests ---');

  // Helper to create dates with specific hours
  const createDate = (day: number, hours: number) => {
    const d = new Date(2026, 9, day); // Oct (0-indexed 9)
    d.setHours(hours, 0, 0, 0);
    return d;
  };

  // 1. Check-in: 1 Mehr (Oct 1) / Check-out: 2 Mehr (Oct 2)
  const checkIn1 = createDate(1, 14);
  const checkOut1 = createDate(2, 12);

  console.log(`Reservation: ${checkIn1.toLocaleString()} to ${checkOut1.toLocaleString()}`);

  // Test on Oct 1
  const oct1 = getEndOfDay(createDate(1, 0));
  const isOccupiedOct1 = checkIn1 <= oct1 && checkOut1 > oct1;
  console.log(`Occupied on Oct 1? ${isOccupiedOct1} (Expected: true)`);

  // Test on Oct 2
  const oct2 = getEndOfDay(createDate(2, 0));
  const isOccupiedOct2 = checkIn1 <= oct2 && checkOut1 > oct2;
  console.log(`Occupied on Oct 2? ${isOccupiedOct2} (Expected: false)`);

  // 2. Check-in: 1 Mehr / Check-out: 3 Mehr
  const checkOut3 = createDate(3, 12);
  const isOccupiedOct2_case2 = checkIn1 <= oct2 && checkOut3 > oct2;
  console.log(`Occupied on Oct 2 (staying until Oct 3)? ${isOccupiedOct2_case2} (Expected: true)`);

  const oct3 = getEndOfDay(createDate(3, 0));
  const isOccupiedOct3 = checkIn1 <= oct3 && checkOut3 > oct3;
  console.log(`Occupied on Oct 3? ${isOccupiedOct3} (Expected: false)`);

  // 3. Consecutive reservations
  const req1_checkIn = createDate(1, 14);
  const req1_checkOut = createDate(2, 12);

  const req2_checkIn = createDate(2, 14);
  const req2_checkOut = createDate(3, 12);

  const overlap = req1_checkIn < req2_checkOut && req1_checkOut > req2_checkIn;
  console.log(`Overlap between 1->2 and 2->3? ${overlap} (Expected: false)`);

  // 4. Checking Active vs Upcoming categorization
  const now = new Date();
  
  // A reservation checking in today
  const checkInToday = new Date(now);
  checkInToday.setHours(14, 0, 0, 0);
  const checkOutTomorrow = new Date(now);
  checkOutTomorrow.setDate(checkOutTomorrow.getDate() + 1);
  checkOutTomorrow.setHours(12, 0, 0, 0);

  const todayEnd = getTodayEnd();
  
  const isActive = checkInToday <= todayEnd && checkOutTomorrow > todayEnd;
  const isUpcoming = checkInToday > todayEnd;

  console.log(`Check-in today -> Active? ${isActive} (Expected: true)`);
  console.log(`Check-in today -> Upcoming? ${isUpcoming} (Expected: false)`);
}

runTests();
