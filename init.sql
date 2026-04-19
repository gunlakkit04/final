CREATE TABLE farm (
  farm_id INT AUTO_INCREMENT PRIMARY KEY,
  farm_name VARCHAR(100),
  location VARCHAR(100),
  phone VARCHAR(20)
);

CREATE TABLE house (
  house_id INT AUTO_INCREMENT PRIMARY KEY,
  house_name VARCHAR(100),
  farm_id INT,
  FOREIGN KEY (farm_id) REFERENCES farm(farm_id)
);

CREATE TABLE employee (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  position VARCHAR(50),
  phone VARCHAR(20),
  farm_id INT,
  FOREIGN KEY (farm_id) REFERENCES farm(farm_id)
);

CREATE TABLE batch (
  batch_id INT AUTO_INCREMENT PRIMARY KEY,
  breed VARCHAR(100),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20),
  initial_qty INT,
  current_qty INT,
  house_id INT,
  FOREIGN KEY (house_id) REFERENCES house(house_id)
);

CREATE TABLE production (
  production_id INT AUTO_INCREMENT PRIMARY KEY,
  production_date DATE,
  egg_qty INT,
  broken_qty INT,
  total_weight_egg FLOAT,
  egg_size VARCHAR(10),
  batch_id INT,
  employee_id INT,
  FOREIGN KEY (batch_id) REFERENCES batch(batch_id),
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
);

INSERT INTO farm (farm_name) VALUES ('Farm A');

INSERT INTO house (house_name, farm_id)
VALUES ('House 1', 1);

INSERT INTO employee (name, position, farm_id)
VALUES ('Somchai', 'Manager', 1);

INSERT INTO batch (breed, start_date, status, house_id)
VALUES ('Hy-Line Brown', '2026-04-19', 'active', 1);