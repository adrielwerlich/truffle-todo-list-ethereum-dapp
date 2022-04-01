

console.log('truffle contract ??', TruffleContract)
App = {
  loading: false
  , contracts: {}

  , load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  }

  , loadWeb3: async () => {
    // if (typeof web3 !== 'undefined') {
    //   App.web3provider = web3.currentProvider
    //   web3 = new Web3(web3.currentProvider)
    // } else {
    //   window.alert('Connect to metamask')
    // }

    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      App.web3provider = window.ethereum
      try {
        await ethereum.enable()
        // web3.eth.sendTransaction()
      } catch (error) {
        console.error('user denied account access', error)
      }
    }
    else {
      alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  , loadAccount: async () => {
    
    web3.eth.getAccounts().then(function (accounts) {
      App.account = accounts[0];
      // App.connectedToWeb3();
    });
  }

  , loadContract: async () => {
    // js version of the contract
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.web3provider)

    // hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()
  }

  , render: async () => {
    // prevent double render
    if (App.loading) {
      return
    }

    // update app loading state
    App.setLoading(true)

    // render account
    $('#account').html(App.account)

    // render tasks
    await App.renderTasks()

    // update loading state
    App.setLoading(false)
  }

  , renderTasks: async () => {
    // load task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    for (let index = 0; index <= taskCount; index++) {
      // fetch from the blockchain
      const task = await App.todoList.tasks(index)
        , id = task[0].toNumber()
        , content = task[1] ? task[1] : null
        , isDone = task[2]

      if (content) {
        // html for the task
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.content').html(content)
        $newTaskTemplate.find('input')
          .prop('name', id)
          .prop('checked', isDone)
          .on('click', App.toggleCompleted)

        if (isDone) {
          $('#completedTaskList').append($newTaskTemplate)
        } else {
          $('#taskList').append($newTaskTemplate)
        }

        // show the task
        $newTaskTemplate.show()
      }
    }
  }

  , toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId, { from: App.account })
    window.location.reload()
  }

  , createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    await App.todoList.createTask(content, { from: App.account })
    window.location.reload()
  }

  , setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
      , content = $('#content')

    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }

}
$(() => {
  $(window).load(() => {
    App.load()
  })
})