document.addEventListener('DOMContentLoaded', function() {
    const wakeForm = document.getElementById('wakeForm');
    const resultArea = document.getElementById('resultArea');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    // デバイスカードの起動ボタン
    const deviceWakeButtons = document.querySelectorAll('.device-wake-btn');
    deviceWakeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mac = this.dataset.mac;
            sendWakeOnLan(mac, this);
        });
    });
    
    // フォーム送信ハンドラ
    wakeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const macAddress = document.getElementById('macAddress').value.trim();
        
        // MACアドレスバリデーション
        if (!isValidMacAddress(macAddress)) {
            showError('有効なMACアドレスを入力してください (例: 00:11:22:33:44:55)');
            return;
        }
        
        const submitButton = wakeForm.querySelector('button[type="submit"]');
        sendWakeOnLan(macAddress, submitButton);
    });
    
    // Wake on LAN送信処理
    async function sendWakeOnLan(macAddress, button) {
        // ボタンのオリジナルテキストを保存
        const originalButtonText = button.innerHTML;
        
        // ボタンを無効化して送信中表示
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';
        
        try {
            // POSTリクエスト送信
            // 運用時はサーバーのURLを変更する
            const response = await fetch('http://localhost:8080/mac_address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mac_address: macAddress })
            });
            
            if (!response.ok) {
                throw new Error(`サーバーエラー: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 成功メッセージを表示
            showSuccess();
            
        } catch (error) {
            console.error('エラー:', error);
            showError(error.message || 'リクエスト送信中にエラーが発生しました');
        } finally {
            // ボタンを元に戻す
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    }
    
    // MACアドレスのバリデーション
    function isValidMacAddress(mac) {
        const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        return regex.test(mac);
    }
    
    // 成功メッセージ表示
    function showSuccess() {
        resultArea.classList.remove('hidden');
        successMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        
        // 5秒後に成功メッセージを非表示
        setTimeout(() => {
            successMessage.classList.add('hidden');
            if (errorMessage.classList.contains('hidden')) {
                resultArea.classList.add('hidden');
            }
        }, 5000);
    }
    
    // エラーメッセージ表示
    function showError(message) {
        resultArea.classList.remove('hidden');
        errorMessage.classList.remove('hidden');
        successMessage.classList.add('hidden');
        errorText.textContent = message;
    }
});