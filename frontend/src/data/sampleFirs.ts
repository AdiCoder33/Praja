export type Status = 'Pending' | 'Resolved';
export type Priority = 'High' | 'Medium' | 'Low';

export interface FIRItem {
  id: string;
  title: string;
  category: string;
  date: string;
  place: string;
  complainant: string;
  status: Status;
  priority: Priority;
  summary: string;
}

export const sampleFIRs: FIRItem[] = [
  { id: '1', title: 'Burglary case in Kartik Nagar', category: 'Theft', date: 'March 29, 2026', place: 'Kartik Nagar, Block C', complainant: 'Anita Sharma', status: 'Pending', priority: 'High', summary: 'Jewelry stolen from residence last night.' },
  { id: '2', title: 'Street fight incident', category: 'Assault', date: 'March 28, 2026', place: 'Old Market Road', complainant: 'Ravi Verma', status: 'Resolved', priority: 'Medium', summary: 'Fight reported near the market; two detained.' },
  { id: '3', title: 'Bike stolen near market', category: 'Theft', date: 'March 27, 2026', place: 'Central Bazaar Parking', complainant: 'Sunil Menon', status: 'Resolved', priority: 'High', summary: 'Parked bike missing; CCTV footage requested.' },
  { id: '4', title: 'Mobile snatching in park', category: 'Theft', date: 'March 27, 2026', place: 'City Park Jogging Track', complainant: 'Priya Nair', status: 'Pending', priority: 'Low', summary: 'Phone snatched during evening jog in the park.' },
  { id: '5', title: 'Cyber fraud UPI scam', category: 'Cyber Crime', date: 'March 26, 2026', place: 'Online / UPI', complainant: 'Sanjay Kulkarni', status: 'Pending', priority: 'High', summary: 'Unauthorized UPI transfers reported; bank alerted.' },
  { id: '6', title: 'Wallet theft in metro', category: 'Theft', date: 'March 26, 2026', place: 'Blue Line Metro, Coach 3', complainant: 'Megha Iyer', status: 'Resolved', priority: 'Medium', summary: 'Wallet stolen in metro coach; CCTV requested from station.' },
  { id: '7', title: 'House trespass attempt', category: 'Trespass', date: 'March 25, 2026', place: 'Sector 5, Plot 42', complainant: 'Shreya Gupta', status: 'Pending', priority: 'High', summary: 'Unknown person attempted to enter house at midnight.' },
  { id: '8', title: 'Verbal harassment complaint', category: 'Harassment', date: 'March 25, 2026', place: 'Bus Stand, Gate 2', complainant: 'Latika Reddy', status: 'Resolved', priority: 'Low', summary: 'Verbal abuse near bus stand; complainant wants warning issued.' },
  { id: '9', title: 'Chain snatching near temple', category: 'Theft', date: 'March 24, 2026', place: 'Lakshmi Temple Street', complainant: 'Kiran Joshi', status: 'Pending', priority: 'High', summary: 'Gold chain snatched; suspect fled on bike.' },
  { id: '10', title: 'Domestic dispute mediation', category: 'Domestic', date: 'March 24, 2026', place: 'Shanti Apartments, Tower B', complainant: 'Neha & Arjun', status: 'Resolved', priority: 'Medium', summary: 'Couple requested mediation; no violence reported.' },
  { id: '11', title: 'Vandalism of parked car', category: 'Property Damage', date: 'March 23, 2026', place: 'Green Meadows Parking', complainant: 'Anil Desai', status: 'Pending', priority: 'Low', summary: 'Car mirrors broken in apartment parking lot.' },
  { id: '12', title: 'Lost passport report', category: 'Lost Property', date: 'March 23, 2026', place: 'Airport Terminal 1', complainant: 'Rohit Khanna', status: 'Pending', priority: 'Medium', summary: 'Passport misplaced during travel; needs acknowledgement.' },
  { id: '13', title: 'Shop burglary overnight', category: 'Theft', date: 'March 22, 2026', place: 'MG Road Electronics Shop', complainant: 'Deepak Malhotra', status: 'Pending', priority: 'High', summary: 'Cash drawer emptied; shutter lock broken.' },
  { id: '14', title: 'ATM card skimming', category: 'Cyber Crime', date: 'March 22, 2026', place: 'Canara Bank ATM, Block A', complainant: 'Ritika Bose', status: 'Resolved', priority: 'Medium', summary: 'Multiple withdrawals after ATM use; bank notified.' },
  { id: '15', title: 'School bullying incident', category: 'Harassment', date: 'March 21, 2026', place: 'Sunrise High School', complainant: 'Parent: Manoj Patil', status: 'Pending', priority: 'Low', summary: 'Student reports repeated bullying on campus.' },
  { id: '16', title: 'Hit and run near circle', category: 'Accident', date: 'March 21, 2026', place: 'City Circle Junction', complainant: 'Irfan Sheikh', status: 'Pending', priority: 'High', summary: 'Car hit pedestrian and fled; partial plate noted.' },
  { id: '17', title: 'Noise complaint at midnight', category: 'Public Nuisance', date: 'March 20, 2026', place: 'Lakeview Residency', complainant: 'Housing RWA', status: 'Resolved', priority: 'Low', summary: 'Loud party in residential area; resolved on visit.' },
  { id: '18', title: 'Stalking reported', category: 'Harassment', date: 'March 20, 2026', place: 'Tech Park Exit Road', complainant: 'Shalini Rao', status: 'Pending', priority: 'Medium', summary: 'Repeated following after office hours; needs patrol.' },
  { id: '19', title: 'Loan app extortion calls', category: 'Cyber Crime', date: 'March 19, 2026', place: 'Phone / Online', complainant: 'Vikram Jadhav', status: 'Pending', priority: 'High', summary: 'Threatening calls demanding repayment with morphed photos.' },
  { id: '20', title: 'Fake job offer scam', category: 'Fraud', date: 'March 19, 2026', place: 'Online job portal', complainant: 'Sarita Mehta', status: 'Resolved', priority: 'Medium', summary: 'Money taken for fake overseas job processing.' },
  { id: '21', title: 'Pet dog missing', category: 'Lost Property', date: 'March 18, 2026', place: 'Maple Colony Park', complainant: 'Anupama Das', status: 'Pending', priority: 'Low', summary: 'Brown labrador missing from colony park.' },
  { id: '22', title: 'Power tool theft from site', category: 'Theft', date: 'March 18, 2026', place: 'Sector 12 Construction Site', complainant: 'Site Manager', status: 'Pending', priority: 'Medium', summary: 'Drills and saws stolen from construction site.' },
  { id: '23', title: 'Cheque fraud attempt', category: 'Fraud', date: 'March 17, 2026', place: 'City Bank Branch', complainant: 'Bank Staff', status: 'Resolved', priority: 'Medium', summary: 'Altered cheque amount identified at bank counter.' },
  { id: '24', title: 'Minor accident dispute', category: 'Accident', date: 'March 17, 2026', place: 'Ring Road Signal 5', complainant: 'Rahul & Manoj', status: 'Resolved', priority: 'Low', summary: 'Two-wheelers collided; no injuries; settlement requested.' },
  { id: '25', title: 'Cyberbullying on social media', category: 'Cyber Crime', date: 'March 16, 2026', place: 'Instagram profile', complainant: 'Ananya S.', status: 'Pending', priority: 'Medium', summary: 'Abusive comments and threats on profile.' },
  { id: '26', title: 'Snatching attempt foiled', category: 'Theft', date: 'March 16, 2026', place: 'City Mall Entry', complainant: 'Security Guard', status: 'Resolved', priority: 'High', summary: 'Attempted purse snatching; suspect caught by public.' },
  { id: '27', title: 'Suspicious drone spotted', category: 'Public Safety', date: 'March 15, 2026', place: 'Power Substation Zone', complainant: 'Control Room', status: 'Pending', priority: 'Low', summary: 'Drone hovering over restricted area at night.' },
  { id: '28', title: 'ATM cash not dispensed', category: 'Service Issue', date: 'March 15, 2026', place: 'Union Bank ATM, City Mall', complainant: 'Customer: Vivek', status: 'Resolved', priority: 'Low', summary: 'Amount debited but cash not dispensed; bank reference raised.' },
  { id: '29', title: 'Elderly missing person', category: 'Missing', date: 'March 14, 2026', place: 'Lotus Park walking trail', complainant: 'Family of Mr. Iyer', status: 'Pending', priority: 'High', summary: '70-year-old missing since morning walk; wearing blue shirt.' },
  { id: '30', title: 'Forgery of property papers', category: 'Fraud', date: 'March 14, 2026', place: 'Sub-registrar Office', complainant: 'Kavita Kulkarni', status: 'Pending', priority: 'High', summary: 'Suspected forged documents for land sale.' },
  { id: '31', title: 'Road rage altercation', category: 'Assault', date: 'March 13, 2026', place: 'NH8 Service Road', complainant: 'Harsh V.', status: 'Resolved', priority: 'Medium', summary: 'Driver assaulted after honking; minor injuries reported.' },
  { id: '32', title: 'Illegal parking nuisance', category: 'Public Nuisance', date: 'March 13, 2026', place: 'Silver Heights Gate', complainant: 'Residents Group', status: 'Pending', priority: 'Low', summary: 'Cars blocking society gate every evening.' },
  { id: '33', title: 'Neighbour dispute over noise', category: 'Public Nuisance', date: 'March 12, 2026', place: 'Block D Apartments', complainant: 'RWA Secretary', status: 'Resolved', priority: 'Low', summary: 'Repeated loud music late night; mediation requested.' },
  { id: '34', title: 'Phishing email loss', category: 'Cyber Crime', date: 'March 12, 2026', place: 'Corporate email account', complainant: 'Employee: Zoya', status: 'Pending', priority: 'Medium', summary: 'Clicked phishing email; small transfer lost; wants record.' },
  { id: '35', title: 'Shoplifting at grocery', category: 'Theft', date: 'March 11, 2026', place: 'FreshMart Grocery', complainant: 'Store Manager', status: 'Resolved', priority: 'Low', summary: 'CCTV caught minor shoplifting; item recovered.' },
  { id: '36', title: 'Assault at parking lot', category: 'Assault', date: 'March 11, 2026', place: 'City Mall Basement Parking', complainant: 'Vikas Malhotra', status: 'Pending', priority: 'High', summary: 'Argument over parking escalated to physical assault.' },
];
