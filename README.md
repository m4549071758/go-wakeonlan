# go-wakeonlan

## HTTPエンドポイント
### ginの初期化、実行
```go
router := gin.Default()

router.Run(":8080")
```

### JSONのやりとり
ここはエンドポイント作るときほぼコピペで良い
```go
// structを定義しておく
type MacAddressRequest struct {
	MacAddress string `json:"mac_address"`
}

// POSTリクエストを受け取る
	router.POST("/mac_address", func(c *gin.Context) {
		var request MacAddressRequest
        // errがnilでない = マッピングに失敗
		if err := c.ShouldBindJSON(&request); err != nil {
			log.Println("JSON解析に失敗:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
			return
		}

        c.JSON(http.StatusOK, gin.H{"message": "Received", "mac_address": address})
    })
```


## マジックパケットの自力生成
### ブロードキャストアドレス作成
```go
ra, _ := net.ResolveUDPAddr("udp", "255.255.255.255:9")
la, _ := net.ResolveUDPAddr("udp", ":0")
c, err := net.DialUDP("udp", la, ra)
if err != nil {
    return err
}
defer c.Close()
```

### MACアドレスをバイナリ化
```go
hw, err := net.ParseMAC(mac)
	if err != nil {
		return err
	}
```

### マジックパケットの生成
```go
packet := []byte{}
prefix := []byte{0xff, 0xff, 0xff, 0xff, 0xff, 0xff}
packet = append(packet, prefix...)

for i := 0; i < 16; i++ {
    packet = append(packet, hw...)
}

_, err = c.Write(packet)
return err
```