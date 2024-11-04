class Board {
    constructor(tileList) {
        this.tileList = tileList
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            // 0からiの範囲でランダムなインデックスを取得
            const randomIndex = Math.floor(Math.random() * (i + 1));
            
            // 要素の入れ替え
            [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
        }
        return arr;
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        // 0からiの範囲でランダムなインデックスを取得
        const randomIndex = Math.floor(Math.random() * (i + 1));
        
        // 要素の入れ替え
        [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
    }
    return arr;
}

module.exports = Board;
