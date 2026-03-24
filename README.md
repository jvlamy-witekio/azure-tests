# azure-tests

## init

func init . --worker-runtime node --language typescript
func new --name MyFunction --template "HTTP trigger"

## run

npm install
npm run build
func start

## publish

func azure functionapp publish iothub-sbx-test
