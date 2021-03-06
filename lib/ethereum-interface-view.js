var AtomSolidityView,
	CompositeDisposable;

CompositeDisposable = require('atom').CompositeDisposable;

module.exports = AtomSolidityView = (function() {
	function AtomSolidityView(serializedState) {
		var mainNode,
			resizeNode,
			accountsNode,
			att,
			buttonNode,
			compileButton,
			compilerNode,
			makeButton,
			message;

		this.handleMouseDown = function(e) {
			if (this.subscriptions != null) {
				this.subscriptions.dispose()
			}

			const mouseUpHandler = (e) => this.handleMouseUp(e)
			const mouseMoveHandler = (e) => this.handleMouseMove(e)
			window.addEventListener('mousemove', mouseMoveHandler)
			window.addEventListener('mouseup', mouseUpHandler)

			this.subscriptions = new CompositeDisposable({
				dispose: () => {
					window.removeEventListener('mousemove', mouseMoveHandler)
				}
			}, {
				dispose: () => {
					window.removeEventListener('mouseup', mouseUpHandler)
				}
			})
		}

		this.handleMouseMove = function(e) {
			// Currently only vertical panel is working, may be later I should add horizontal panel
			const width = this.element.getBoundingClientRect().right - e.pageX;
			const vwidth = window.innerWidth;
			const vw = (width / vwidth) * 100 + 'vw';
			this.element.style.width = vw;
		}

		this.handleMouseUp = function(e) {
			if (this.subscriptions) {
				this.subscriptions.dispose()
			}
		}

		this.dispose = function() {
			this.destroy()
		}

		this.element = document.createElement;
		this.element = document.createElement('atom-panel');
		this.element.classList.add('etheratom-panel');

		// empty div to handle resize
		resizeNode = document.createElement('div');
		resizeNode.onmousedown = this.handleMouseDown.bind(this);
		resizeNode.classList.add('etheratom-panel-resize-handle');
		resizeNode.setAttribute('ref', 'resizehandle');
		this.element.appendChild(resizeNode);

		mainNode = document.createElement('div');
		mainNode.classList.add('atom-solidity');
		mainNode.classList.add('native-key-bindings');
		mainNode.setAttribute('tabindex', '-1');

		message = document.createElement('div');
		message.textContent = "Atom Ethereum Interface";
		message.classList.add('compiler-info');
		message.classList.add('inline-block');
		message.classList.add('highlight-info');
		mainNode.appendChild(message);

		compilerNode = document.createElement('div');
		att = document.createAttribute('id');
		att.value = 'compiler-options';
		compilerNode.setAttributeNode(att);
		mainNode.appendChild(compilerNode);

		accountsNode = document.createElement('div');
		att = document.createAttribute('id');
		att.value = 'accounts-list';
		accountsNode.setAttributeNode(att);
		mainNode.appendChild(accountsNode);

		buttonNode = document.createElement('div');
		att = document.createAttribute('id');
		att.value = 'common-buttons';
		buttonNode.setAttributeNode(att);
		buttonNode.classList.add('block');

		compileButton = document.createElement('div');
		att = document.createAttribute('id');
		att.value = 'compile_btn';
		compileButton.setAttributeNode(att);
		compileButton.classList.add('inline-block');

		makeButton = document.createElement('div');
		att = document.createAttribute('id');
		att.value = 'make_btn';
		makeButton.setAttributeNode(att);
		makeButton.classList.add('inline-block');
		buttonNode.appendChild(compileButton);
		buttonNode.appendChild(makeButton);
		mainNode.appendChild(buttonNode);

		this.compiledNode = document.createElement('div');
		att = document.createAttribute('id');
		att.value = 'compiled-code';
		this.compiledNode.setAttributeNode(att);
		this.compiledNode.classList.add('compiled-code');
		mainNode.appendChild(this.compiledNode);

		// Finally append mainNode to element
		this.element.appendChild(mainNode);

	}

	AtomSolidityView.prototype.serialize = function() {};

	AtomSolidityView.prototype.destroy = function() {
		return this.element.remove();
	};

	AtomSolidityView.prototype.getElement = function() {
		return this.element;
	};

	AtomSolidityView.prototype.createTextareaR = function(text) {
		var textNode;
		this.text = text;
		textNode = document.createElement('pre');
		textNode.textContent = this.text;
		textNode.classList.add('large-code');
		return textNode;
	};

	AtomSolidityView.prototype.destroyPass = function() {
		var addressNode, passNode;
		addressNode = document.getElementById("accounts-list");
		passNode = addressNode.childNodes[0].childNodes[1];
		if (passNode) {
			return passNode.parentNode.removeChild(passNode);
		}
	};

	AtomSolidityView.prototype.destroyCompiled = function() {
		var preCompiledNode, results;
		preCompiledNode = document.getElementById("compiled-code");
		if (preCompiledNode) {
			results = [];
			while (preCompiledNode.firstChild) {
				results.push(preCompiledNode.removeChild(preCompiledNode.firstChild));
			}
			return results;
		}
	};

	AtomSolidityView.prototype.setContractView = function(name, bytecode1, abiDef, inputs, estimatedGas) {
		var att, bcNode, buttonText, bytecode, cNode, callButton, cnameNode, contractABI, contractName, createAddr, createButton, createStat, estimatedGasInput, input, inputText, inputsNode, lineBr, messageNode, textNode, title, varName;
		this.name = name;
		this.bytecode = bytecode1;
		this.abiDef = abiDef;
		this.inputs = inputs;
		this.estimatedGas = estimatedGas;
		contractName = this.name;
		bytecode = JSON.stringify(this.bytecode);
		contractABI = JSON.stringify(this.abiDef);

		cNode = document.createElement('div');
		att = document.createAttribute('id');
		att.value = contractName;
		cNode.classList.add('contract-display');
		cNode.setAttributeNode(att);

		cnameNode = document.createElement('span');
		cnameNode.classList.add('contract-name');
		cnameNode.classList.add('inline-block');
		cnameNode.classList.add('highlight-success');

		title = document.createTextNode(contractName);
		cnameNode.appendChild(title);
		cNode.appendChild(cnameNode);

		bcNode = document.createElement('div');
		bcNode.classList.add('byte-code');

		textNode = this.createTextareaR(bytecode);
		bcNode.appendChild(textNode);
		cNode.appendChild(bcNode);

		messageNode = document.createElement('div');
		messageNode.classList.add('abi-definition');

		textNode = this.createTextareaR(contractABI);
		messageNode.appendChild(textNode);
		cNode.appendChild(messageNode);

		inputsNode = document.createElement('div');
		att = document.createAttribute('id');
		att.value = contractName + '_inputs';
		inputsNode.setAttributeNode(att);
		for (input in this.inputs) {
			buttonText = document.createElement('button');
			buttonText.classList.add('input');
			buttonText.classList.add('text-subtle');
			varName = document.createTextNode(this.inputs[input].name);
			buttonText.appendChild(varName);
			inputsNode.appendChild(buttonText);
			inputText = document.createElement('input');
			att = document.createAttribute('id');
			att.value = this.inputs[input].name;
			inputText.setAttributeNode(att);
			inputText.setAttribute('type', 'text');
			inputText.classList.add('inputs');
			inputText.setAttribute('value', this.inputs[input].type);
			inputsNode.appendChild(inputText);
			lineBr = document.createElement('br');
			inputsNode.appendChild(lineBr);
		}
		cNode.appendChild(inputsNode);

		buttonText = document.createElement('button');
		buttonText.classList.add('input');
		buttonText.classList.add('text-subtle');

		varName = document.createTextNode("Estimated Gas");
		buttonText.appendChild(varName);
		inputsNode.appendChild(buttonText);

		estimatedGasInput = document.createElement('input');
		att = document.createAttribute('id');
		att.value = contractName + '_gas';
		estimatedGasInput.setAttributeNode(att);
		estimatedGasInput.setAttribute('type', 'number');
		estimatedGasInput.classList.add('inputs');
		estimatedGasInput.setAttribute('value', this.estimatedGas);
		inputsNode.appendChild(estimatedGasInput);

		createButton = document.createElement('div');
		att = document.createAttribute('id');
		att.value = contractName + '_create';
		createButton.setAttributeNode(att);
		inputsNode.appendChild(createButton);

		createStat = document.createElement('div');
		att = document.createAttribute('id');
		att.value = contractName + '_stat';
		createStat.setAttributeNode(att);
		cNode.appendChild(createStat);

		createAddr = document.createElement('div');
		att = document.createAttribute('id');
		att.value = contractName + '_address';
		createAddr.setAttributeNode(att);
		att = document.createAttribute('class');
		att.value = contractName;
		createAddr.setAttributeNode(att);
		cNode.appendChild(createAddr);

		callButton = document.createElement('div');
		att = document.createAttribute('id');
		att.value = contractName + '_call';
		callButton.setAttributeNode(att);
		cNode.appendChild(callButton);
		this.compiledNode.appendChild(cNode);
		return;
	};

	return AtomSolidityView;

})();
