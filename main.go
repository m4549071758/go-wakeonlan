package main

import (
	"log"
	"net"
	"net/http"

	"github.com/gin-gonic/gin"
)

type MacAddressRequest struct {
	MacAddress string `json:"mac_address"`
}

func main() {
	// :=で型推論
	router := gin.Default()

	router.POST("/mac_address", func(c *gin.Context) {
		var request MacAddressRequest

		// errがnilでない = マッピングに失敗
		if err := c.ShouldBindJSON(&request); err != nil {
			log.Println("JSON解析に失敗:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
			return
		}

		address := request.MacAddress

		// SendWakeOnLanを呼び出し
		err := SendWakeOnLan(address)
		if err != nil {
			log.Println("マジックパケットの送信に失敗")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sent magic packet"})
		}
		c.JSON(http.StatusOK, gin.H{"message": "Received", "mac_address": address})
	})
	router.Run()
}

func SendWakeOnLan(address string) error {
	// UDPの9番ポートへブロードキャスト
	ra, err := net.ResolveUDPAddr("udp4", "255.255.255.255:9")
	if err != nil {
		return err
	}

	la, err := net.ResolveUDPAddr("udp4", ":0")
	if err != nil {
		return err
	}

	c, err := net.DialUDP("udp4", la, ra)
	if err != nil {
		return err
	}
	defer c.Close()

	// ParseMAC()で文字列アドレスをバイナリ化
	hw, err := net.ParseMAC(address)
	if err != nil {
		return err
	}

	// 規則にしたがってマジックパケットを生成
	packet := []byte{}
	prefix := []byte{0xff, 0xff, 0xff, 0xff, 0xff, 0xff}
	packet = append(packet, prefix...)

	for i := 0; i < 16; i++ {
		packet = append(packet, hw...)
	}

	_, err = c.Write(packet)
	return err
}
