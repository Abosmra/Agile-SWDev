import React from 'react';

export default function StudentSchedule() {
  const scheduleData = [
    { slot: 1, time: '8:00 - 8:50', saturday_s5: 'PHM123: Introduction to Physical Electronics - Lec. (944A)', saturday_s6: '', sunday_s5: '', sunday_s6: '', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: 'CSE241: Object-oriented Progran', wednesday_s6: '', thursday_s5: '', thursday_s6: '' },
    { slot: 2, time: '9:00 - 9:50', saturday_s5: '', saturday_s6: '', sunday_s5: 'PHM121 - Lab 219', sunday_s6: 'PHM141 - Lab 248', monday_s5: '', monday_s6: '', tuesday_s5: 'PHM112: Mathematics - Lec. (921A)', tuesday_s6: '', wednesday_s5: '', wednesday_s6: '(911A)', thursday_s5: '', thursday_s6: '' },
    { slot: 3, time: '10:00 - 10:50', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: 'PHM141: Engineering Chemistry - Lec. (914A)', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: 'CSE142: Introduction to So', wednesday_s6: '', thursday_s5: '', thursday_s6: '' },
    { slot: 4, time: '11:00 - 11:50', saturday_s5: 'PHM123 - Tut. (941)', saturday_s6: 'CSE142 - Tut. (942)', sunday_s5: '', sunday_s6: '', monday_s5: 'PHM121: Vibration and waves - Lec. (914A)', monday_s6: '', tuesday_s5: '', tuesday_s6: 'PHM121 - Tut. (913)', wednesday_s5: '', wednesday_s6: 'Engineering - Lec. (931', thursday_s5: '', thursday_s6: '' },
    { slot: 'Break', time: '11:50 - 12:30', saturday_s5: 'Break', saturday_s6: 'Break', sunday_s5: 'Break', sunday_s6: 'Break', monday_s5: 'Break', monday_s6: 'Break', tuesday_s5: 'Break', tuesday_s6: 'Break', wednesday_s5: 'Break', wednesday_s6: 'Break', thursday_s5: 'Break', thursday_s6: 'Break', isBreak: true },
    { slot: 5, time: '12:30 - 1:20', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: 'PHM112 - Tut. (942)', monday_s5: '', monday_s6: '', tuesday_s5: 'PHM121 Lab 219', tuesday_s6: '', wednesday_s5: '', wednesday_s6: 'PHM113: Probability and Statistics - Lec. (931A)', thursday_s5: '', thursday_s6: '' },
    { slot: 6, time: '1:30 - 2:20', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: '', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: 'PHM112 - Tut. (932)', wednesday_s6: 'PHM121 - Tut. (922)', thursday_s5: '', thursday_s6: '' },
    { slot: 7, time: '2:30 - 3:20', saturday_s5: '', saturday_s6: 'CSE241 - Lab (338)', sunday_s5: '', sunday_s6: '', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: '', wednesday_s6: '', thursday_s5: '', thursday_s6: '' },
    { slot: 8, time: '3:30 - 4:20', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: 'CSE241 - Lab (348)', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: '', wednesday_s6: 'PHM113 - Tut. (921)', thursday_s5: '', thursday_s6: '' },
    { slot: 9, time: '4:30 - 5:20', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: '', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: 'PHM113 - Tut. (931)', wednesday_s6: '', thursday_s5: '', thursday_s6: '' },
    { slot: 10, time: '5:30 - 6:20', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: '', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: '', wednesday_s6: '', thursday_s5: '', thursday_s6: '' },
    { slot: 11, time: '6:30 - 7:20', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: '', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: '', wednesday_s6: '', thursday_s5: '', thursday_s6: '' },
    { slot: 12, time: '7:30 - 8:20', saturday_s5: '', saturday_s6: '', sunday_s5: '', sunday_s6: '', monday_s5: '', monday_s6: '', tuesday_s5: '', tuesday_s6: '', wednesday_s5: '', wednesday_s6: '', thursday_s5: '', thursday_s6: '' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>My Schedule</h2>
      
      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000',
          minWidth: '1200px'
        }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Slot</th>
              <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Time</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>Saturday</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>Sunday</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>Monday</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>Tuesday</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>Wednesday</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold', background: '#e0e0e0' }}>Thursday</th>
            </tr>
            <tr style={{ background: '#f9f9f9' }}>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}></th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}></th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S5</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S6</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S5</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S6</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S5</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S6</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S5</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S6</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S5</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S5</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S6</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>S6</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((row, index) => (
              <tr key={index} style={{ background: row.isBreak ? '#FFFF00' : (index % 2 === 0 ? '#ffffff' : '#f9f9f9') }}>
                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{row.slot}</td>
                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontWeight: row.isBreak ? 'bold' : 'normal' }}>{row.time}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.saturday_s5}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.saturday_s6}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.sunday_s5}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.sunday_s6}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.monday_s5}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.monday_s6}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.tuesday_s5}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.tuesday_s6}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.thursday_s5}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.thursday_s6}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.wednesday_s5}</td>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontSize: '12px' }}>{row.wednesday_s6}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
