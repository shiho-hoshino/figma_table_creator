
figma.showUI(__html__);

figma.ui.onmessage = async msg => {

  if (msg.type === 'setData') {
    /**
     * Googleスプレッドシートから取得する情報
     */
    const values = JSON.parse(JSON.stringify(msg.response.data.values));

    let selection: any = [];
    const {currentPage} = figma;
    const selectionNode = currentPage.selection;
    
    if (selectionNode.length > 0) {
      const x = selectionNode[0].x;
      const y = selectionNode[0].y + selectionNode[0].height + 20;


      /**
       * @param node テキストを反映するNode
       * @param text 変更するテキスト
       */
      const changeText = function(node, text) {
        const obj: any = {};
        if (node.characters) {
          try   {
            node.deleteCharacters(0, node.characters.length);
            node.insertCharacters(0, text);
          } catch(e) {
            console.log(e);
          }
        }
      };

      /**
       * @param obj 行
       * @param textData 行のテキスト
       * @param num 列番号
       */
      const setText = function(obj, textData, characterNodes=[]){
        if (Array.isArray(obj)) {
          obj.map((node :any, index) => {
            if (node.name.indexOf('#col') != -1) {
              characterNodes.push(node);
            } else if (node.children) {
              setText(node.children, textData, characterNodes);
            }
          });
        } else {
          if (obj.name.indexOf('#col') != -1) {
            characterNodes.push(obj);
          } else if (obj.children) {
            setText(obj.children, textData, characterNodes);
          }
        }

        return characterNodes;
      }

      const cloneNodes: SceneNode[] = [];
      figma.loadFontAsync({
        "family": "Helvetica",
        "style": "Regular"
      }).then(() => {
        selectionNode.map((node, index) => {
          values.map((value, i) => {
            // nodeをデータ分cloneし配列に追加
            cloneNodes.push(node.clone())
            // cloneしたnodeにテキストを反映
            const characterNodes = setText(cloneNodes[i], value);
            characterNodes.map((node, i) => {
              const text = value[i] || '';
              changeText(node, text);
            });
          });
        })
        
        // フレーム作成
        const frame = figma.createFrame();
        figma.currentPage.selection = [frame];
        frame.x = x;
        frame.y = y;

        // Auto layout を有効にする
        frame.layoutMode = "VERTICAL";

        // フレームに作成した行Nodeを追加
        cloneNodes.map((node, index) => {
          frame.insertChild(index, node);
        });

        // コンテンツサイズで自動リサイズするモードに変更
        frame.primaryAxisSizingMode = "AUTO";
        frame.counterAxisSizingMode = "AUTO";
      });
    }
  }

  // figma.closePlugin();
};

