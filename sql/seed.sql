insert into roles (name) values ('Server'), ('Cook'), ('Manager') on conflict do nothing;

insert into employees (full_name, role_id, payroll_identifier, category, tip_eligible)
select 'Alex Rivera', r.id, 'CRZ-001', 'front_of_house', true from roles r where r.name='Server'
union all
select 'Jamie Park', r.id, 'CRZ-002', 'kitchen', false from roles r where r.name='Cook'
union all
select 'Morgan Lee', r.id, 'CRZ-003', 'manager_admin', false from roles r where r.name='Manager';

insert into tip_rules (name, method) values ('Default daily hour split', 'hours_per_day');

insert into tip_entries (tip_date, cash_tips, card_tips, notes)
values (current_date - interval '1 day', 120, 320, 'Dinner rush');
