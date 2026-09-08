// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Structs {
    struct Student {
        string name;
        uint256 age;
        bool active;
    }

    Student[] private students;
    mapping(address => Student) private studentByAddress;

    function addStudent(string calldata name, uint256 age) external {
        Student memory newStudent = Student({
            name: name,
            age: age,
            active: true
        });

        students.push(newStudent);
        studentByAddress[msg.sender] = newStudent;
    }

    function getStudent(uint256 index) external view returns (string memory, uint256, bool) {
        require(index < students.length, "Index out of bounds");
        Student memory student = students[index];
        return (student.name, student.age, student.active);
    }

    function getMyStudent() external view returns (string memory, uint256, bool) {
        Student memory student = studentByAddress[msg.sender];
        return (student.name, student.age, student.active);
    }

    function deactivateStudent(uint256 index) external {
        require(index < students.length, "Index out of bounds");
        students[index].active = false;
    }

    function totalStudents() external view returns (uint256) {
        return students.length;
    }
}
