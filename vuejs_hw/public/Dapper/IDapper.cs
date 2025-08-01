using System.Data;
using System.Data.Common;
using Dapper;

namespace Conex.Management.Repositories.DapperORM;

public interface IDapper : IDisposable
{
    DbConnection CreateManagedConnection();
    Task<T?> GetAsync<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text);
    Task<List<T>> GetAllAsync<T>(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text);
    Task<List<T>> BatchGetAllAsync<T>(string sp, object[] items, CommandType commandType = CommandType.Text);
    Task<int> InsertAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text);
    Task<int> UpdateAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text);
    Task<int> DeleteAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text);
    Task<int?> BatchInsertAsync(string sp, object[] items, CommandType commandType = CommandType.Text);
    Task<int?> BatchUpdateAsync(string sp, object[] items, CommandType commandType = CommandType.Text);
    Task<int?> BatchDeleteAsync(string sp, object[] items, CommandType commandType = CommandType.Text);
    Task<int> ExecuteAsync(string sp, object[]? items = null, CommandType commandType = CommandType.Text);
    Task<int> ExecuteByParamsAsync(string sp, DynamicParameters parms, CommandType commandType = CommandType.Text);
}