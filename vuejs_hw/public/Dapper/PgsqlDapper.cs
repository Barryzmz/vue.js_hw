using Microsoft.EntityFrameworkCore;
using System.Data;
using Dapper;
using Npgsql;
using Conex.Management.Repositories.Security;
using System.Data.Common;

namespace Conex.Management.Repositories.DapperORM;

public class PgsqlDapper : IDapper
{
    private readonly string _connectionStr;

    public PgsqlDapper(string connectionStr)
    {
        DefaultTypeMap.MatchNamesWithUnderscores = true;
        _connectionStr = GetDecryptConn(connectionStr);
    }

    public static string GetDecryptConn(string cipherConnectionString)
    {
        var npgsqlSB = new NpgsqlConnectionStringBuilder(cipherConnectionString);
        npgsqlSB.Password = AesOperation.DecryptString("f654+h=321f85de@5s6f?42130rs5b86", npgsqlSB.Password ?? string.Empty);
        npgsqlSB.MaxPoolSize = 32767;
        npgsqlSB.NoResetOnClose = true;
        npgsqlSB.ConnectionIdleLifetime = 300;
        npgsqlSB.ConnectionPruningInterval = 100;

        return npgsqlSB.ConnectionString;
    }

    private NpgsqlConnection OpenSqlConnection()
    {
        var db = new NpgsqlConnection(_connectionStr);

        if (db.State == ConnectionState.Closed)
        {
            db.Open();
        }

        return db;
    }

    public DbConnection CreateManagedConnection()
    {
        var db = new NpgsqlConnection(_connectionStr);

        if (db.State == ConnectionState.Closed)
        {
            db.Open();
        }

        return db;
    }

    public async Task<T?> GetAsync<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await QueryFirstOrDefaultAsync<T>(sp, parms, commandType) ?? default;
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<List<T>> GetAllAsync<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await QueryAsync<T>(sp, parms, commandType);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<List<T>> BatchGetAllAsync<T>(string sp, object[] items, CommandType commandType = CommandType.Text)
    {
        try
        {
            using (var db = OpenSqlConnection())
            {
                return (await db.QueryAsync<T>(sp, items, commandType: commandType)).ToList();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    public async Task<int> InsertAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await ExecuteByParamsAsync(sp, parms, commandType);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int?> BatchInsertAsync(string sp, object[] items, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await ExecuteAsync(sp, items, commandType);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int> UpdateAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await ExecuteByParamsAsync(sp, parms, commandType);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int?> BatchUpdateAsync(string sp, object[] items, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await ExecuteAsync(sp, items, commandType);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int> DeleteAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await ExecuteByParamsAsync(sp, parms, commandType);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int?> BatchDeleteAsync(string sp, object[] items, CommandType commandType = CommandType.Text)
    {
        try
        {
            return await ExecuteAsync(sp, items, commandType);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int> ExecuteAsync(string sp, object[]? items, CommandType commandType = CommandType.Text)
    {
        var affectedRows = 0;
        using (var db = OpenSqlConnection())
        {
            using (var tran = db.BeginTransaction())
            {
                try
                {
                    affectedRows = await db.ExecuteAsync(sp, items, transaction: tran, commandTimeout: 60, commandType: commandType);
                    tran.Commit();
                }
                catch (Exception ex)
                {
                    tran.Rollback();
                    Console.WriteLine($"Error: {ex.Message}");
                    throw;
                }
            }
        }

        return affectedRows;
    }

    public async Task<int> ExecuteByParamsAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {
        var affectedRows = 0;
        using (var db = OpenSqlConnection())
        {
            using (var tran = db.BeginTransaction())
            {
                try
                {
                    int commandTimeout = 60;
                    affectedRows = await db.ExecuteAsync(sp, parms, transaction: tran, commandTimeout: commandTimeout, commandType: commandType);
                    tran.Commit();
                }
                catch (Exception ex)
                {
                    tran.Rollback();
                    Console.WriteLine($"Error: {ex.Message}");
                    throw;
                }
            }
        }

        return affectedRows;
    }

    #region Basic Dapper Handler
    private async Task<T?> QueryFirstOrDefaultAsync<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {

        try
        {
            using (var db = OpenSqlConnection())
            {
                return await db.QueryFirstOrDefaultAsync<T>(sp, parms, commandType: commandType) ?? default;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }

    private async Task<List<T>> QueryAsync<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text)
    {
        try
        {
            using (var db = OpenSqlConnection())
            {
                return (await db.QueryAsync<T>(sp, parms, commandType: commandType)).ToList();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            throw;
        }
    }
    #endregion

    public void Dispose()
    {
    }
}