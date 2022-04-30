
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
       * @param nodes 最終的なreturn値
       */
      const getColNodes = function(obj, nodes=[]){
        if (Array.isArray(obj)) {
          obj.map((node :any, index) => {
            if (node.name.indexOf('#col') != -1) {
              nodes.push(node);
            } else if (node.children) {
              getColNodes(node.children, nodes);
            }
          });
        } else {
          if (obj.name.indexOf('#col') != -1) {
            nodes.push(obj);
          } else if (obj.children) {
            getColNodes(obj.children, nodes);
          }
        }

        return nodes;
      }

      const cloneNodes: SceneNode[] = [];
      figma.loadFontAsync({
        "family": "Helvetica",
        "style": "Regular"
      }).then(() => {
        selectionNode.map((node, index) => {
          // スプレッドシートの行ごとに処理
          values.map((value, i) => {
            // nodeをcloneし配列に追加
            cloneNodes.push(node.clone())
            // cloneしたnodeからテキストを反映するnode要素を取得
            const colNodes = getColNodes(cloneNodes[i]);
            // 指定要素にテキストを反映
            colNodes.map((node, i) => {
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

