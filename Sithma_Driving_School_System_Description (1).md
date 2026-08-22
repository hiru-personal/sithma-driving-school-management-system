**SITHMA DRIVING SCHOOL Management System** 

_System Description Document_ 

Campus Project Prepared by: Hiruni Dissanayake Version 1.0 

# **1. Introduction** 

Sithma Driving School currently manages student registrations, lesson bookings, and license progress manually. This document describes the proposed Sithma Driving School Management System, which digitizes the registration process, lesson scheduling, payment verification, and exam preparation for students, instructors, and office staff across all branches. 

## **1.1 Purpose** 

This document explains, in simple terms, how the system is expected to work — covering student types, vehicle categories, pricing, lesson booking, license progression rules, payments, and notifications — so that all stakeholders (students, staff, owner and the development team) share a common understanding of the system. 

## **1.2 System Users** 

- Student — registers for driving lessons, books time slots, tracks exam/medical/trial dates, and practices exam questions. 

- Data Entry Officer / Staff — registers students in the system and updates dates received from the Department of Motor Traffic (DMT)., verifies payment slips, manages bookings, and views student progress. 

- Instructor — conducts practical lessons and theory/practical classes at the assigned branch. 

# **2. Student Categories** 

The system supports two categories of students, based on how far they have progressed with the Department of Motor Traffic (DMT) process before joining Sithma Driving School. 

## **2.1 Type 1 — New Learner Students** 

These students join Sithma Driving School before completing their DMT learner's registration. 

- The student registers with Sithma first, before registering with the DMT for a learner's license. 

- The DMT provides a date for medical examination and learner registration. 

- The student, the Data Entry Officer, or the assigned staff member can update the system with the dates received from the DMT. 

- If the student fails either the medical examination or the learner's exam, a new date must be obtained and updated in the system. 

- Only after passing the learner's exam does the student become eligible to start Trial (practical) lessons at Sithma. 

## **2.2 Type 2 — Trial-Ready Students** 

These students have already completed their DMT medical, registration, and learner's exam independently, and join Sithma Driving School specifically to get accustomed to the Trial (practical driving test) process. 

- The student registers directly with Sithma for Trial lessons. 

- Trial dates are booked through the system based on Trial slot availability. 

_Note: Both student types can be registered through the same system. All relevant dates (registration, medical,_ _<mark>exam, and trial) are visible to both the student and staff, and an in-app notification is sent whenever a date is set</mark> or updated._ 

## **2.3 Trial and License Timeline Rules** 

- A student must pass the Trial (practical driving test) within 1.5 years of passing the learner's exam in order to obtain the driving license. 

- The first Trial date is normally offered 3 months after the student passes the learner's exam. 

- If a Trial attempt is failed, the student may book a new Trial date. 

- A student is allowed a maximum of 3 Trial attempts. If all 3 attempts fail, the student cannot proceed further. 

# **3. Vehicle Categories** 

Vehicles offered by Sithma Driving School are grouped into two categories: 

- Light Vehicle — Car, Bike, Three-Wheeler 

- Heavy Vehicle — Bus 

One driving lesson is equal to half an hour (30 minutes), for all vehicle types. 

# **4. Course Packages and Pricing** 

## **4.1 Car Package (Full License Package)** 

- 15 lessons for a full upfront payment of Rs. 45,000, taken at the time of registration. 

- This package includes 2 free Three-Wheeler lessons and 2 free Bike lessons as a bonus. 

_Note: The 2 free Three-Wheeler and 2 free Bike lessons are bundled into the Rs. 45,000 Car package. A student who only needs the Car license may not make use of these bonus lessons, but they remain part of the package._ 

## **4.2 Refresher Car Lessons** 

For students who already hold a Car license but need practice (for example, those who have not driven in a while and want to regain confidence), a smaller refresher package is available: 

- 6 lessons for Rs. 15,000. 

## **4.3 Bike and Three-Wheeler (Standalone Lessons)** 

- Bike lessons — Rs. 850 per lesson. Students may book any number of lessons they wish. 

- Three-Wheeler lessons — Rs. 1,000 per lesson. Students may book any number of lessons they wish. 

## **4.4 Heavy Vehicle (Bus) Package** 

- 15 lessons for Rs. 65,000. 

- Eligibility: A student must have held a Light Vehicle driving license for a minimum of 2 years before registering for a Heavy Vehicle license. 

- Registration process: Same as the Type 2 (Trial-Ready) process used for Light Vehicles, since Heavy Vehicle applicants already hold a license and go directly toward the Trial stage. 

## **4.5 Pricing Summary** 

|**Package**|**Lessons**|**Price (Rs.)**|**Notes**|
|---|---|---|---|
|Car — Full Package|15|45,000|Includes 2 free Bike + 2 free<br>Three-Wheeler lessons|
|Car — Refresher|6|15,000|For existing Car license<br>holders|
|Bike (standalone)|As chosen|850 / lesson|Flexible quantity|
|Three-Wheeler (standalone)|As chosen|1,000 / lesson|Flexible quantity|
|Heavy Vehicle (Bus)|15|65,000|Requires 2+ years Light<br>Vehicle license|



## **4.6 Additional Lessons** 

After registration, a student can request and add extra lessons for any vehicle type at any time, beyond the lessons included in their original package. 

# **5. Branches and Instructors** 

- Sithma Driving School operates 3 branches: Maharagama, Werahara, and 

- There are 6 instructors across the branches. 

At each branch, there are approximately 3 lesson sessions per day, each session lasting 1 hour. Time slots are not fixed and can vary by branch — staff can adjust the available slots manually as needed. 

# **6. Lesson Booking and Scheduling** 

- At the time of registration, the student selects the vehicle type(s) and the number of lessons required. 

- The student then chooses a preferred time slot from the slots available at their branch. 

- Full lesson details — package, price, lessons remaining, and schedule — are visible to both the student and the officer/staff at all times. 

# **7. Free Weekly Theory and Practical Classes** 

Each week, Sithma Driving School conducts free theory and practical classes on select days. Students can book a slot for these sessions through the system at no additional charge. 

# **8. Payment Process** 

- Payments are made outside the system (e.g., bank transfer), and the student uploads a photo/scan of the payment slip into the system. 

- Staff review the uploaded slip and manually verify the payment within the system before it is marked as confirmed. 

# **9. Notifications** 

The system sends in-app notifications to students and staff whenever a registration, medical date, exam date, or trial date is set or updated, so both parties stay informed without needing to check manually. 

# **10. Online Exam Practice Module** 

The system includes a simple practice quiz module that allows students to practice the type of questions asked in the DMT written exam. 

- Questions are available in Sinhala, Tamil, and English. 

- This is intended as informal practice and is not a scored or formally tracked assessment. 

# **11. Registration Form** 

The registration form captures the student's details along with the vehicle/license type being applied for, in line with the categories described in Section 3 (Light Vehicle — Car, Bike, Three-Wheeler; or Heavy Vehicle — Bus), and the student type (Type 1 or Type 2). 

# **12. Summary of Key Rules** 

- Two student types: Type 1 (new learners, register before DMT learner registration) and Type 2 (already passed learner's exam, joining for Trial practice). 

- Trial must be passed within 1.5 years of the learner's exam; first Trial date offered 3 months after passing the exam; maximum 3 Trial attempts. 

- Car package: 15 lessons / Rs. 45,000, includes 2 free Bike + 2 free Three-Wheeler lessons. 

- Refresher Car package: 6 lessons / Rs. 15,000, for existing license holders. 

- Bike: Rs. 850/lesson, Three-Wheeler: Rs. 1,000/lesson — flexible quantity. 

- Heavy Vehicle (Bus): 15 lessons / Rs. 65,000, requires 2+ years on a Light Vehicle license. 

- 3 branches (Maharagama, Werahara, Delgoda), 6 instructors, flexible/adjustable time slots. 

- Free weekly theory/practical classes, bookable at no charge. 

- Payment verification via uploaded slip, checked manually by staff. 

In-app notifications for all key dates; multilingual (Sinhala/Tamil/English) exam practice quiz. 

