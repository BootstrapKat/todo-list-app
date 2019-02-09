/*global app, jasmine, describe, it, beforeEach, expect */

describe('controller', function () {
	'use strict';

	var subject, model, view;

	var setUpModel = function (todos) {
		model.read.and.callFake(function (query, callback) {
			callback = callback || query;
			callback(todos);
		});

		model.getCount.and.callFake(function (callback) {

			var todoCounts = {
				active: todos.filter(function (todo) {
					return !todo.completed;
				}).length,
				completed: todos.filter(function (todo) {
					return !!todo.completed;
				}).length,
				total: todos.length
			};

			callback(todoCounts);
		});

		model.remove.and.callFake(function (id, callback) {
			callback();
		});

		model.create.and.callFake(function (title, callback) {
			callback();
		});

		model.update.and.callFake(function (id, updateData, callback) {
			callback();
		});
	};

	var createViewStub = function () {
		var eventRegistry = {};
		return {
			render: jasmine.createSpy('render'),
			bind: function (event, handler) {
				eventRegistry[event] = handler;
			},
			trigger: function (event, parameter) {
				eventRegistry[event](parameter);
			}
		};
	};

	beforeEach(function () {
		model = jasmine.createSpyObj('model', ['read', 'getCount', 'remove', 'create', 'update']);
		view = createViewStub();
		subject = new app.Controller(model, view);
	});

	it('should show entries on start-up', function () {
		// TODO: write test

		var todo = {}; //todos is empty
        setUpModel([todo]); //setup the model

        subject.setView(''); //set the view

        //expects the view to render with showEntries and the empty array
        expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
	
		// ENDTEST
	});

	describe('routing', function () {

		it('should show all entries without a route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show all entries without "all" route', function () {
			var todo = {title: 'my todo'};
			setUpModel([todo]);

			subject.setView('#/');

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);
		});

		it('should show active entries', function () {
			// TODO: write test
			/*
			////////// ln 74 controller.js ////////////
			Controller.prototype.showActive = function () {
					var self = this;
					self.model.read({ completed: false }, function (data) {
						self.view.render('showEntries', data);
					});
				};
			*/
			var todo = {title: 'my todo', completed: false}; 
			setUpModel([todo]);
			
			subject.setView('#/active'); //set view to display Active items

			expect(model.read).toHaveBeenCalledWith({completed: false}, jasmine.any(Function)); // call model.read method with completed false and function as parameters.

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]); //render method is next showing the entries and the todo array

			expect(todo.completed).toEqual(false); //todo completed should still be false!

			//ENDTEST
		});

		it('should show completed entries', function () {
			// TODO: write test
			/*
			/////////// ln 84 controller.js /////////////
			Controller.prototype.showCompleted = function () {
				var self = this;
				self.model.read({ completed: true }, function (data) {
					self.view.render('showEntries', data);
				});
			};
			*/

			var todo = {title: 'my todo', completed: true};
			setUpModel([todo]);

			subject.setView('#/completed'); //set view to display Complete items

			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));

			expect(view.render).toHaveBeenCalledWith('showEntries', [todo]);

			expect(todo.completed).toEqual(true);

			//ENDTEST
		});
	});

	it('should show the content block when todos exists', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: true
		});
	});

	it('should hide the content block when no todos exists', function () {
		setUpModel([]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('contentBlockVisibility', {
			visible: false
		});
	});

	it('should check the toggle all button, if all todos are completed', function () {
		setUpModel([{title: 'my todo', completed: true}]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('toggleAll', {
			checked: true
		});
	});

	it('should set the "clear completed" button', function () {
		var todo = {id: 42, title: 'my todo', completed: true};
		setUpModel([todo]);

		subject.setView('');

		expect(view.render).toHaveBeenCalledWith('clearCompletedButton', {
			completed: 1,
			visible: true
		});
	});

	it('should highlight "All" filter by default', function () {
		// TODO: write test
		////////// ln 43 view.js ////////
		/* View.prototype._setFilter = function (currentPage) {
				qs('.filters .selected').className = '';
				qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
			};
		*/
		
		//Setup Default environment
		var currentPage = '';
		setUpModel([]);
		subject.setView('');
		
		expect(view.render).toHaveBeenCalledWith('setFilter', currentPage);

		//ENDTEST

	});

	it('should highlight "Active" filter when switching to active view', function () {
		// TODO: write test
		////////// ln 43 view.js ////////
		/* View.prototype._setFilter = function (currentPage) {
				qs('.filters .selected').className = '';
				qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
			};
		*/

		//Setup Active environment
		var currentPage = 'active';
		setUpModel([]);
		subject.setView('#/active');

		expect(view.render).toHaveBeenCalledWith('setFilter', currentPage);

		//ENDTEST
	});

	describe('toggle all', function () {
		//create a beforeEach function to setup test environment
		beforeEach(function () {
			var todos = [
				{
					id: 1,
					title: 'my todo 1',
					completed: false
				},
				{
					id: 2,
					title: 'my todo 2',
					completed: false
				}
			];

			setUpModel(todos);

			subject.setView('');

			//establish the toggleAll as on or 'true'
			view.trigger('toggleAll', {completed: true});
		});

		it('should toggle all todos to completed', function () {
			// TODO: write test
			////////// ln 185 view.js /////////////
			/*
			else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});
			*/

			//'update' the todo items in the beforeEach, completed needs to be true
			expect(model.update).toHaveBeenCalledWith(1, {completed: true}, jasmine.any(Function));

			expect(model.update).toHaveBeenCalledWith(2, {completed: true}, jasmine.any(Function));
			//ENDTEST
		});

		it('should update the view', function () {
			// TODO: write test

			//'update' the todo items in the beforeEach view status with elementComplete (reference ln 48 in view.js)

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id:1, completed: true});
			
			expect(view.render).toHaveBeenCalledWith('elementComplete', {id:2, completed: true});
			//ENDTEST
		});
	});

	describe('new todo', function () {
		it('should add a new todo to the model', function () {
			// TODO: write test
			/////////ln 175 view.js////////
			/*
			if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});
			*/

			//setup model
			setUpModel([]);
			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			//use the spy "model.create" with the 'a new todo' using jasmine.any for boolean comparison
			expect(model.create).toHaveBeenCalledWith('a new todo', jasmine.any(Function));
			//ENDTEST
			
		});

		it('should add a new todo to the view', function () {
			setUpModel([]);

			subject.setView('');

			view.render.calls.reset();
			model.read.calls.reset();
			model.read.and.callFake(function (callback) {
				callback([{
					title: 'a new todo',
					completed: false
				}]);
			});

			view.trigger('newTodo', 'a new todo');

			expect(model.read).toHaveBeenCalled();

			expect(view.render).toHaveBeenCalledWith('showEntries', [{
				title: 'a new todo',
				completed: false
			}]);
		});

		it('should clear the input field when a new todo is added', function () {
			setUpModel([]);

			subject.setView('');

			view.trigger('newTodo', 'a new todo');

			expect(view.render).toHaveBeenCalledWith('clearNewTodo');
		});
	});

	describe('element removal', function () {
		beforeEach(function () {
			var todo = 
				{
					id: 42,
					title: 'my todo',
					completed: true
				}
			;

			setUpModel([todo]);

			subject.setView('');
			view.trigger('itemRemove', {id: 42});
		});

		it('should remove an entry from the model', function () {
			// TODO: write test
			//////// ln 195 view.js /////////////
			/*
			else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});
			*/
			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
			
			//ENDTEST
		});

		it('should remove an entry from the view', function () {
			
			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});

		it('should update the element count', function () {
			
			expect(view.render).toHaveBeenCalledWith('updateElementCount', 0);
		});
	});

	describe('remove completed', function () {

		//add in a beforeEach to preven DRY code
		beforeEach(function () {
			var todo = 
				{
					id: 42,
					title: 'my todo',
					completed: true
				}
			;

			setUpModel([todo]);

			subject.setView('');
			view.trigger('removeCompleted');
		});

		it('should remove a completed entry from the model', function () {
	
			expect(model.read).toHaveBeenCalledWith({completed: true}, jasmine.any(Function));

			expect(model.remove).toHaveBeenCalledWith(42, jasmine.any(Function));
		});

		it('should remove a completed entry from the view', function () {
	
			expect(view.render).toHaveBeenCalledWith('removeItem', 42);
		});
	});

	describe('element complete toggle', function () {
		it('should update the model', function () {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 21, completed: true});

			expect(model.update).toHaveBeenCalledWith(21, {completed: true}, jasmine.any(Function));
		});

		it('should update the view', function () {
			var todo = {id: 42, title: 'my todo', completed: true};
			setUpModel([todo]);
			subject.setView('');

			view.trigger('itemToggle', {id: 42, completed: false});

			expect(view.render).toHaveBeenCalledWith('elementComplete', {id: 42, completed: false});
		});
	});

	describe('edit item', function () {

		//add in a beforeEach to prevent DRY code
		beforeEach(function() {
			var todo = {id: 21, title: 'my todo', completed: false};
			setUpModel([todo]);

			subject.setView('');

		})
		it('should switch to edit mode', function () {
			

			view.trigger('itemEdit', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItem', {id: 21, title: 'my todo'});
		});

		it('should leave edit mode on done', function () {
			

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'new title'});
		});

		it('should persist the changes on done', function () {
			

			view.trigger('itemEditDone', {id: 21, title: 'new title'});

			expect(model.update).toHaveBeenCalledWith(21, {title: 'new title'}, jasmine.any(Function));
		});

		it('should remove the element from the model when persisting an empty title', function () {
			

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(model.remove).toHaveBeenCalledWith(21, jasmine.any(Function));
		});

		it('should remove the element from the view when persisting an empty title', function () {
			

			view.trigger('itemEditDone', {id: 21, title: ''});

			expect(view.render).toHaveBeenCalledWith('removeItem', 21);
		});

		it('should leave edit mode on cancel', function () {
			

			view.trigger('itemEditCancel', {id: 21});

			expect(view.render).toHaveBeenCalledWith('editItemDone', {id: 21, title: 'my todo'});
		});

		it('should not persist the changes on cancel', function () {
			

			view.trigger('itemEditCancel', {id: 21});

			expect(model.update).not.toHaveBeenCalled();
		});
	});
});
