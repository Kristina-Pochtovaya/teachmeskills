create table if not exists users (
	id bigint generated always as identity primary key,
	firstName text not null,
	lastName text not null,
	dateOfBirth date  not null,
	isActive boolean default false,
	city text
);

insert into users(firstName, lastName, dateOfBirth, isActive, city) values
	('Kate', 'Smith','1992-12-10', true, 'Vilnius'),
	('Anna', 'Jones', '1990-10-01', true, 'Paris'),
	('John', 'Taylor','1995-03-29', true, 'Warsaw');

insert into users(firstName, lastName, dateOfBirth, isActive, city) values
	('Kate', 'Smith','1992-12-10', true, 'Vilnius'),
	('Anna', 'Jones', '1990-10-01', true, 'Paris'),
	('John', 'Taylor','1995-03-29', true, 'Warsaw');

insert into users(firstName, lastName, dateOfBirth, isActive) values
	('Henry', 'Williams','1989-05-20', false)
	
insert into users(firstName, lastName, dateOfBirth) values
	('Alice', 'Brown','1985-03-11')
	
update users set city = 'Vilnius' where city is null;

select * from users
where city = 'Vilnius'
order by id asc;

select  city, COUNT(*) as total_users from users
group by city
having COUNT(*) > 1
order by total_users asc;

select * from users 
where isactive = true
order by id asc;