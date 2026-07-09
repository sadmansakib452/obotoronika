create table site_settings_general (
    id serial primary key,
    site_name text not null,
    favicon text,
    logo text,
    description text not null,
    language text not null,
    currency text not null,
    timezone text not null,
    email text not null,
    phone text not null,
    address text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);