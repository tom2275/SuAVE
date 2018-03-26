class PrefixTreeNode {
    constructor(value) {
      this.children = {};
      this.endWord = null;
      this.value = value;
      this.f = 0;
    }
}

class PrefixTree extends PrefixTreeNode {
    constructor() {
      super(null);
    }
  
    addWord(string) {
      const addWordHelper = (node, str) => {
        if (!node.children[str[0]]) {
          node.children[str[0]] = new PrefixTreeNode(str[0]);
          if (str.length === 1) {
            node.children[str[0]].endWord = 1;
            node.children[str[0]].f += 1;
          }
        } else {
  
        }
        if (str.length > 1) {
          addWordHelper(node.children[str[0]], str.slice(1));
        }
      };
      addWordHelper(this, string);
    }

    predictWord(string) {
        var getRemainingTree = function(string, tree) {
          var node = tree;
          while (string && (node != undefined)) {
            node = node.children[string[0]];
            string = string.substr(1);
          }
          return node;
        };
    
        var allWords = [];
        
        var allWordsHelper = function(stringSoFar, tree) {
          for (let k in tree.children) {
            const child = tree.children[k]
            var newString = stringSoFar + child.value;
            if (child.endWord) {
              allWords.push(newString);
            }
            allWordsHelper(newString, child);
          }
        };
    
        var remainingTree = getRemainingTree(string, this);
        if (remainingTree) {
          allWordsHelper(string, remainingTree);
        }
    
        return allWords;
      }

      topFive(string) {
        var getRemainingTree = function(string, tree) {
          var node = tree;
          while (string && (node != undefined)) {
            node = node.children[string[0]];
            string = string.substr(1);
          }
          return node;
        };
    
        var allWordsWithf = {};
        var allWords = [];
        
        var allWordsHelper = function(stringSoFar, tree) {
          for (let k in tree.children) {
            const child = tree.children[k]
            var newString = stringSoFar + child.value;
            
            if (child.endWord) {
              allWords.push(newString);
              allWordsWithf[newString] = child.f;
            }
            allWordsHelper(newString, child);
          }
        };
    
        var remainingTree = getRemainingTree(string, this);
        if (remainingTree) {
          allWordsHelper(string, remainingTree);
        }

        var sorted = [];
        for(var key in allWordsWithf) {
            sorted[sorted.length] = key;
        }
        sorted.sort();
        sorted.reverse();

        return sorted.slice(0,5);
      }
}