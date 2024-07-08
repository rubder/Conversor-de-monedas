        let myChart;

        async function convertAndUpdate(amount, currencyCode) {
            try {
                const convertedAmount = await convertCurrency(amount, currencyCode);
                const historicalData = await fetchHistoricalData(currencyCode);

                const resultElement = document.getElementById('conversion-result');
                resultElement.textContent = `Resultado: ${amount} CLP = ${convertedAmount.toFixed(2)} ${currencyCode}`;

                drawChart(historicalData);
            } catch (error) {
                console.error('Error during conversion:', error);
                const resultElement = document.getElementById('conversion-result');
                resultElement.textContent = 'Error en la conversión. Inténtelo nuevamente.';
            }
        }

        document.getElementById('currency-select').addEventListener('change', function() {
            const amount = parseFloat(document.getElementById('amount-input').value);
            const currencyCode = this.value;
            convertAndUpdate(amount, currencyCode);
        });

        function handleConversion() {
            const amount = parseFloat(document.getElementById('amount-input').value);
            const currencyCode = document.getElementById('currency-select').value;
            convertAndUpdate(amount, currencyCode);
        }

        async function fetchExchangeRates() {
            const url = 'https://mindicador.cl/api';
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched exchange rates:', data); 
                return data;
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
                throw error; 
            }
        }

        async function convertCurrency(amount, currencyCode) {
            const exchangeRates = await fetchExchangeRates();
            if (!exchangeRates) {
                throw new Error('No se pudo obtener los tipos de cambio');
            }

            const rate = exchangeRates[currencyCode.toLowerCase()]?.valor; 
            if (!rate) {
                throw new Error(`No se encontró la tasa de cambio para ${currencyCode}`);
            }

            const convertedAmount = amount / rate;
            return convertedAmount;
        }

        function drawChart(data) {
            const labels = data.map(entry => entry.fecha.slice(0, 10));
            const values = data.map(entry => entry.valor);

            if (myChart) {
                myChart.destroy();
            }

            const ctx = document.getElementById('chart').getContext('2d');
            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.reverse(), 
                    datasets: [{
                        label: 'Valor de la moneda seleccionada',
                        data: values.reverse(), 
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        }

        async function fetchHistoricalData(currencyCode) {
            const url = `https://mindicador.cl/api/${currencyCode.toLowerCase()}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched historical data:', data);
                const historicalData = data.serie.slice(0, 10).reverse(); 
                return historicalData;
            } catch (error) {
                console.error('Error fetching historical data:', error);
                throw error; 
            }
        }