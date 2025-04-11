database schema

user(basically dentist) table{
    id, 
    fname not null,
    email,
    total patients, 

}

patients {
    id, 
    fname, not null
    lname, 
    age,
    address, 
    notes, 
    next-appointment, 
    last-visited, 
    first-visited, 
    ai-pic,
}

I have clerk for authentication and user sign in and signup. and clerk is already working.


whenever new user sign up then new row should be created in "users' table in supabase. 
it should also work if he uses google or apple signup. 
his name should be extracted using the email or name using useUser or something like that. 


I have added supabase url and anonkey in .env file. 

I want to add patient record dedicated to paticular user/doctor. they can add new patient in  paitent table after they have selected on of AI generated image from generateimagesscreen.tsx. inside (tabs) so you have to firs update that screen code by giving select option of any one of image by giving select cirle on top left corner of generated image. user should be able to selected only one image at a time. after selecting on image then he can press done button. after pressing the done button new user will be created for that paticular user with all the name, age and all other that user filled initially. you will create new patient block of this patient inside manage patient with it name, age and date when ai image generated. profile pic of this new patient will be his/her ai generated pic. when we click on that user and it's information should show up like we have patientdetailscreen.tsx. here under ai image generated in patientdetailscreen there will be ai generated image of that patient. 

you can use securestore for storing all the details in local memory. whenever user signouts and sign back in then he should his records, means store them related to particualr user in local stoargte...because one user can have multiple account and i dont want all record from different account to show at one place. record related to particular record should be seen when that particular account is signed in or active. 









