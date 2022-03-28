pragma solidity ^0.5.0;

contract TodoList {
     uint taskCount = 0;

     struct Task {
         uint id;
         string content;
         bool completed;
     }

     mapping(uint => Task) public tasks;

     constructor() public {
         createTask("become expert dapp solidity ethereum developer");
     }

    function createTask(string memory _content) public {
        taskCount ++;
        tasks[taskCount] = Task(taskCount, _content, false);
    }
}