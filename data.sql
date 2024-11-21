\c biztime
DROP TABLE IF EXISTS invoices CASCADE;

DROP TABLE IF EXISTS companies CASCADE;

DROP TABLE IF EXISTS industries CASCADE;

DROP TABLE IF EXISTS industries_companies CASCADE;

CREATE TABLE companies(
  code text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text
);

CREATE TABLE invoices(
  id serial PRIMARY KEY,
  comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT FALSE NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date,
  CONSTRAINT invoices_amt_check CHECK ((amt >(0)::double precision))
);

CREATE TABLE industries(
  code text PRIMARY KEY,
  industry text NOT NULL
);

CREATE TABLE industries_companies(
  ind_id text NOT NULL REFERENCES industries(code),
  comp_code text NOT NULL REFERENCES companies(code),
  PRIMARY KEY (ind_id, comp_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
('ibm', 'IBM', 'Big blue.');

INSERT INTO invoices(comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, FALSE, NULL),
('apple', 200, FALSE, NULL),
('apple', 300, TRUE, '2018-01-01'),
('ibm', 400, FALSE, NULL);

INSERT INTO industries
  VALUES ('acc', 'Accounting'),
('hr', 'Human Resources'),
('cs', 'Customer Service');

INSERT INTO industries_companies
  VALUES ('acc', 'apple'),
('hr', 'ibm');

