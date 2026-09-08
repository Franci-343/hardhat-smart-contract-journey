// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

contract Enums {
    enum Status {
        Pending,
        Active,
        Completed,
        Cancelled
    }

    Status public status;

    constructor() {
        status = Status.Pending;
    }

    function activate() external {
        require(status == Status.Pending, "Only pending can activate");
        status = Status.Active;
    }

    function complete() external {
        require(status == Status.Active, "Only active can complete");
        status = Status.Completed;
    }

    function cancel() external {
        require(status != Status.Completed, "Already completed");
        status = Status.Cancelled;
    }

    function getStatusName() external view returns (string memory) {
        if (status == Status.Pending) {
            return "Pending";
        }

        if (status == Status.Active) {
            return "Active";
        }

        if (status == Status.Completed) {
            return "Completed";
        }

        return "Cancelled";
    }
}
