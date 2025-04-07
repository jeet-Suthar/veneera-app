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

whenever new user sign up then new row should be created in "users' table in supabase. 
it should also work if he uses google or apple signup. 
his name should be extracted using the email. 









