@echo off
aws dynamodb create-table --table-name warStats --attribute-definitions AttributeName=tag,AttributeType=S AttributeName=warNumber,AttributeType=N   --key-schema  AttributeName=tag,KeyType=HASH  AttributeName=warNumber,KeyType=RANGE --provisioned-throughput  ReadCapacityUnits=1,WriteCapacityUnits=1
aws dynamodb describe-table --table-name warStats

pause